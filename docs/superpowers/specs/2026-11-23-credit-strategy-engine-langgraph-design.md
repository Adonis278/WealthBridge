# Credit Strategy Engine on LangGraph — Design

**Date:** 2026-11-23
**Owner:** Jerome Adonis
**Status:** Approved, ready for implementation planning

---

## 1. Context

The credit analysis agent today is a single OpenAI chat completion in
`Wealth-Bridge/app/api/credit-report-analyze/route.ts` (208 lines). One prompt
asks the model to extract accounts from the report text, compute utilisation
and debt-to-income, and write a ten-section strategy, all in one pass. The
result is parsed with `JSON.parse` inside a `try`; on failure `result` becomes
`null` and the UI renders gaps rather than an error.

Three consequences follow from that shape:

- **The arithmetic is generated, not computed.** The prompt contains
  instructions like "always show utilisation math" because the model is doing
  the sums. Those figures are presented to users as fact and cannot be verified.
- **There is no schema.** `AnalysisPayload` types `factorBreakdown`,
  `recommendedActions` and `rawResult` as `Record<string, unknown>`, so a
  malformed response is stored and only discovered when something renders.
- **A bad run is opaque.** There is no trace of what the model received or why
  it answered as it did.

`Wealth-Bridge/functions/index.js` is a 243-line copy of the same prompt and
logic. Nothing has routed to it since the `hosting` block was removed from
`firebase.json`; it is dead code.

A prior design document, `AI_Credit_Optimization_Design_Doc.md`, specifies the
intended output schema, the core calculations (utilisation, DTI, inquiries,
account age) and edge-case modes for scores below 580 and above 760. Those
requirements are carried into this design.

## 2. Goals

1. Validated, typed output. A response that does not match the schema is
   repaired or rejected — never stored.
2. Deterministic arithmetic. Utilisation, DTI, account ages and inquiry counts
   are computed in TypeScript, not produced by the model.
3. Discrete, inspectable steps, with per-run tracing.
4. A typed storage shape that removes every `Record<string, unknown>` from the
   analysis path.

## 3. Non-goals

Explicitly out of scope for this spec:

- **The Navigator conversational agent.** It is a separate subsystem with its
  own state model and storage, and it consumes this engine's output. It gets
  its own spec after this ships.
- **Computed/generated separation as a storage feature**, time-series metric
  history, and LangGraph checkpoint persistence. Considered and deliberately
  dropped to keep this focused.
- **Changing where the app runs.** The graph runs in the existing Next.js API
  route.
- **Retrieval or a vector store.** No RAG in this design.

## 4. Architecture

```
POST /api/credit-report-analyze
  ├─ verifyRequest(request)        existing, unchanged
  ├─ checkRateLimit(uid)           existing, unchanged
  └─ runCreditStrategyGraph(input)
       ├─ extract     (LLM)      → CreditReportFacts
       ├─ compute     (pure TS)  → CreditMetrics
       ├─ route       (edge)     → rebuild | standard | optimise
       ├─ strategise  (LLM)      → StrategyNarrative
       └─ validate    (Zod)      → CreditAnalysis
```

`validate` is a loop, not a terminal node: on a Zod failure it re-enters
`strategise` with the validation error appended to the prompt, up to two
retries. `extract` and `compute` are not re-run, because their output was
already valid.

### Why the split

Moving arithmetic out of the prompt is the central change. `compute` receives
structured accounts from `extract` and produces exact figures. `strategise`
then receives verified numbers as input rather than being asked to derive them.
The current prompt's pleading about showing the math becomes unnecessary,
because the math is already done.

For a consumer-credit product this is also the difference between a number that
can be defended and one the model produced.

### Score bands

Routing follows the prior design document:

| Band | Range | Prompt emphasis |
|---|---|---|
| `rebuild` | score < 580 | Secured cards, credit-builder loans, derogatory strategy |
| `standard` | 580–759 | Utilisation reduction, payment history, mix |
| `optimise` | score ≥ 760 | Maintenance, limit management, rewards |

When no score can be extracted, the band is `standard` and the narrative is
flagged with `extractionDegraded`.

### File layout

```
Wealth-Bridge/lib/agent/
  schema.ts              Zod schemas + inferred types (single source of truth)
  graph.ts               StateGraph definition and compilation
  nodes/extract.ts       report text → structured facts
  nodes/compute.ts       pure functions; no I/O, no model
  nodes/strategise.ts    band-specific prompt selection and invocation
  nodes/validate.ts      Zod parse and repair loop
  prompts/extract.ts
  prompts/strategise.ts  one template per band
```

Each file has one responsibility and can be read without the others.
`nodes/compute.ts` imports nothing from LangChain, which is what makes it
unit-testable.

### Dependencies

`@langchain/langgraph`, `@langchain/openai`, `@langchain/core`, `zod`.
All run in the Node runtime the route already declares.

### Models

Both LLM nodes default to `gpt-4o-mini`, preserving today's default and the
existing `LLM_MODEL` / `LLM_BASE_URL` / `LLM_API_KEY` environment overrides.
`extract` runs at `temperature: 0`; `strategise` keeps `temperature: 0.2`.

## 5. Data contract

All types are inferred from Zod schemas in `lib/agent/schema.ts`. The schema is
the single source of truth: it validates the model's output and types the
Firestore read.

```ts
CreditReportFacts {            // extracted by the model
  score: number | null
  accounts: Array<{
    creditor: string
    type: 'revolving' | 'installment' | 'mortgage' | 'other'
    balance: number | null
    limit: number | null
    status: 'open' | 'closed' | 'collection' | 'charge_off' | 'unknown'
    openedAt: string | null    // ISO date
  }>
  inquiries: Array<{ creditor: string; date: string | null }>
  derogatories: Array<{
    creditor: string
    kind: 'collection' | 'charge_off' | 'late' | 'bankruptcy' | 'other'
    amount: number | null
    status: string | null
  }>
}

CreditMetrics {                // computed in TypeScript — exact
  utilisationPct: number | null
  totalRevolvingBalance: number | null
  totalRevolvingLimit: number | null
  dtiPct: number | null
  monthlyIncome: number | null
  monthlyDebt: number | null
  inquiriesLast12m: number
  averageAccountAgeMonths: number | null
  oldestAccountAgeMonths: number | null
  scoreBand: 'rebuild' | 'standard' | 'optimise'
}

StrategyNarrative {            // generated by the model
  summary: string
  factorAnalysis: Array<{
    factor: 'payment_history' | 'utilisation' | 'credit_age'
          | 'credit_mix' | 'new_credit'
    finding: string
    whyItMatters: string
    whatToFix: string
    impact: 'High' | 'Medium' | 'Low'
    estimatedGain: string      // a range, never a guarantee
  }>
  riskAlerts: string[]
  actionPlan: Array<{ phase: string; steps: string[] }>
  projection: {
    projectedScore: number | null
    timelineMonths: number | null
    notes: string
  }
}

CreditAnalysis {
  schemaVersion: 3
  facts: CreditReportFacts
  metrics: CreditMetrics
  narrative: StrategyNarrative
  meta: {
    modelVersion: string
    agentVersion: string
    generatedAt: Timestamp
    extractionDegraded: boolean
    retryCount: number
  }
}
```

`estimatedGain` is a free-text range by design. The existing disclaimers and
the "no guaranteed outcomes" rule in the prompts are retained.

### Size limits

To keep documents clear of Firestore's 1 MB ceiling — today `rawAdvice` is
stored unbounded — the schema enforces: `summary` ≤ 2,000 characters, each
`steps` entry ≤ 500, `riskAlerts` ≤ 10 entries, `actionPlan` ≤ 6 phases.
Over-long model output is truncated at validation with a flag, not rejected.

## 6. Storage

Paths are unchanged:

- `users/{uid}/credit_builder_sessions/{sessionId}` — field `analysis`
- `users/{uid}/credit_builder_sessions/{sessionId}/analysis_versions/{id}`

Both now hold a `CreditAnalysis` at `schemaVersion: 3`.

No Firestore rules change is required. The existing rules already demand
`schemaVersion is int` on session writes and `createdAt != null` on version
documents, and both still hold.

### Backward compatibility

Readers branch on `schemaVersion`:

- `2` (or absent) — the existing blob shape. Rendered through a read-only
  legacy adapter in the profile and history views. No new features apply.
- `3` — the typed shape, full functionality.

No migration script. Old analyses remain readable and age out naturally.
`lib/creditBuilderService.ts` keeps `AnalysisPayload` as the v2 type and gains
`CreditAnalysis` as v3; `saveAnalysis` and `appendAnalysisVersion` accept the
new type.

## 7. Error handling

| Failure | Behaviour |
|---|---|
| `extract` returns unparseable output | Retry once at `temperature: 0`. On second failure, continue with empty facts and `extractionDegraded: true`. Never fabricate accounts. |
| `compute` has insufficient inputs | Affected metrics are `null`, not zero. A null utilisation is "unknown", and the narrative must not treat it as 0%. |
| `strategise` output fails Zod | Re-enter `strategise` with the validation error appended. Up to 2 retries. |
| Retries exhausted | Session set to `analysis_error` via the existing `saveAnalysisError`. **No partial analysis is written.** |
| OpenAI non-200 | Existing behaviour: log upstream detail server-side, return 502 with a generic message. |
| Graph throws | Existing 500 handler; upstream detail is never returned to the client. |

The principle: a run either produces a fully valid `CreditAnalysis` or it
produces an error. There is no partially-populated analysis in storage.

## 8. Observability

LangSmith tracing, configured by environment:

```
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=<secret>
LANGCHAIN_PROJECT=wealthbridge-credit-engine
```

When `LANGCHAIN_API_KEY` is absent, tracing is off and the graph runs normally
— no hard dependency. The key is bound the same way `OPENAI_API_KEY` is, via
`frameworksBackend.secrets` in `firebase.json`.

Traces must not be relied on for anything user-facing; they are a debugging aid.

## 9. Testing

| Target | Approach |
|---|---|
| `nodes/compute.ts` | Unit tests over fixtures: utilisation with mixed account types, DTI, zero/absent limits, no accounts, closed accounts excluded. These are pure functions — **this logic has never been testable before.** |
| `schema.ts` | Zod parse tests: valid payload, missing field, wrong enum, over-length truncation. |
| Band routing | Boundary tests at 579/580 and 759/760. |
| `graph.ts` | Integration test with a stubbed model, asserting node order and the retry path. |
| Route | Existing auth and rate-limit behaviour unchanged; 401 and 429 tests still apply. |

No live model calls in tests.

## 10. Cleanup

- Delete `Wealth-Bridge/functions/index.js` and the `functions` block in
  `firebase.json`. It duplicates this prompt and is unreachable.
- Keep the client-side `analyzeReportText` regex in `credit-builder/page.tsx`
  only for the instant pre-analysis preview shown at upload. It no longer feeds
  the analysis and must not be presented as a result.

## 11. Risks

**Two LLM calls instead of one.** Latency and cost roughly double. Mitigated by
running `extract` on `gpt-4o-mini` at `temperature: 0`, where the task is
mechanical. Accepted knowingly.

**The graph runs inside the SSR Cloud Function.** The app serves from Firebase
Hosting's webframeworks integration, which Firebase has closed to new Next.js
participation and labels preview. A long graph run competes with page
rendering. `maxDuration` is already 120s. If this proves to bite, the fallback
is moving the engine to its own Cloud Function — the route boundary makes that
a contained change, since nothing outside `lib/agent/` depends on where it runs.

**Extraction quality sets the ceiling.** Every downstream number depends on the
model reading the report correctly. A misread credit limit produces a confident,
wrong utilisation figure. This is why extraction failure degrades loudly via
`extractionDegraded` rather than silently returning zeroes.
