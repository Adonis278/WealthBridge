const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

function parseMoney(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[^\d.-]/g, '').trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

// Only our own origins may call this. A wildcard on an endpoint that spends
// money on every request lets anyone drain the LLM budget from any page.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

function setCors(req, res) {
  const origin = req.get('origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

/** Verify the Firebase ID token on the Authorization header. */
async function verifyCaller(req) {
  const header = req.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;

  try {
    return await admin.auth().verifyIdToken(match[1], true);
  } catch (error) {
    logger.warn('ID token verification failed', { message: error && error.message });
    return null;
  }
}

exports.creditReportAnalyze = onRequest({ region: 'us-central1', timeoutSeconds: 120 }, async (req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    // This endpoint costs money per call, so it is never anonymous.
    const caller = await verifyCaller(req);
    if (!caller) {
      res.status(401).json({ error: 'Sign in to run an analysis.' });
      return;
    }

    let body = {};
    if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else if (req.rawBody) {
      try {
        body = JSON.parse(req.rawBody.toString('utf8'));
      } catch {
        body = {};
      }
    }
    const text = typeof body.text === 'string' ? body.text : '';
    const score = typeof body.score === 'number' ? body.score : undefined;
    const profile = body.profile || {};

    if (!text) {
      res.status(400).json({ error: 'Missing report text.' });
      return;
    }

    const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
    const baseUrl = process.env.LLM_BASE_URL || DEFAULT_BASE_URL;
    const model = process.env.LLM_MODEL || DEFAULT_MODEL;

    if (!apiKey) {
      res.status(500).json({ error: 'LLM API key not configured.' });
      return;
    }

    const financialContext = body.financialContext || {};
    const annualIncome = parseMoney(financialContext.annualIncome);
    const monthlyIncome = annualIncome && annualIncome > 0 ? annualIncome / 12 : null;
    const monthlyDebt = parseMoney(financialContext.monthlyDebt);
    const declaredTotalCreditLimit = parseMoney(financialContext.totalCreditLimit);
    const dtiPercent =
      monthlyIncome && monthlyIncome > 0 && monthlyDebt != null
        ? Number(((monthlyDebt / monthlyIncome) * 100).toFixed(1))
        : null;

    const prompt = `You are a consumer credit strategy analyst.
Your job is to generate a personalized, actionable, easy-to-understand credit improvement report.

Core rules:
- Do NOT give generic advice.
- Do NOT show abstract scoring percentages without explanation.
- Do NOT provide guaranteed point increases.
- Do NOT sound like a textbook.
- Use dollar amounts and real math whenever possible.
- Tie every recommendation to the user's goal, income, debt, and account data.

You MUST return ONLY valid JSON, no markdown code fences and no extra text.

Return JSON with this exact shape:
{
  "credit_summary": {
    "current_score": <number>,
    "score_band": <"Poor"|"Fair"|"Good"|"Very Good"|"Exceptional">,
    "projected_score": <number>,
    "projection_timeline_months": <number>
  },
  "factor_analysis": {
    "payment_history": { "current": <0-100>, "ideal": 100, "impact_level": <"High"|"Medium"|"Low">, "estimated_score_gain": "<range only>", "recommendation": "<specific action>" },
    "utilization": { "current": <0-100>, "ideal": 30, "impact_level": <"High"|"Medium"|"Low">, "estimated_score_gain": "<range only>", "recommendation": "<specific action>" },
    "credit_age": { "current": <0-100>, "ideal": 80, "impact_level": <"High"|"Medium"|"Low">, "estimated_score_gain": "<range only>", "recommendation": "<specific action>" },
    "credit_mix": { "current": <0-100>, "ideal": 70, "impact_level": <"High"|"Medium"|"Low">, "estimated_score_gain": "<range only>", "recommendation": "<specific action>" },
    "new_credit": { "current": <0-100>, "ideal": 80, "impact_level": <"High"|"Medium"|"Low">, "estimated_score_gain": "<range only>", "recommendation": "<specific action>" }
  },
  "goal_alignment": {
    "readiness_score_percent": <0-100>,
    "dti_percent": <number|null>,
    "notes": "<goal readiness assessment>"
  },
  "risk_alerts": ["<specific risk>", "..."],
  "action_plan": [
    { "phase": "Month 1-2", "steps": ["<specific step>", "..."] },
    { "phase": "Month 3-4", "steps": ["<specific step>", "..."] },
    { "phase": "Month 5-6", "steps": ["<specific step>", "..."] }
  ],
  "strategy_report_markdown": "<markdown report using EXACTLY the 10 required sections below>"
}

The markdown report must follow this exact section order and heading style:
1️⃣ WHY YOUR SCORE IS [Current Score]
2️⃣ TOP SCORE DRIVERS (RANKED BY IMPACT)
3️⃣ CREDIT UTILIZATION – SHOW THE MATH
4️⃣ NEGATIVE ACCOUNTS STRATEGY
5️⃣ DEBT-TO-INCOME (DTI) ANALYSIS
6️⃣ GOAL READINESS ANALYSIS
7️⃣ PRIORITY ACTION PLAN (RANKED)
8️⃣ SCORE PROJECTION SCENARIOS
9️⃣ WHAT NOT TO DO
🔟 SUMMARY

Hard requirements for the markdown report:
- Consumer-first, specific, motivating, trust-building tone.
- Use plain English and concrete account details from the report.
- Include 2-4 most impactful issues in section 1.
- In section 2, list top 3-5 factors with: What we found / Why this matters / What to fix / Impact Level.
- In section 3, always show utilization math:
  total revolving limit, total revolving balance, current utilization %, 30% target balance, dollar paydown needed.
  If partial paydown examples are possible, show estimated new utilization.
- In section 4, if collections/charge-offs exist, list each with creditor, amount, status, age, then strategy options (pay-for-delete if applicable, settlement, dispute, or when to leave alone), with risk and timing.
- In section 5, calculate DTI using monthly income and minimum debt payments; classify as Excellent (<28%), Acceptable (28-36%), Risky (>36%) and tie to user goal.
- In section 6, goal-specific readiness (home/car/card/rental/business funding/improve score).
- In section 7, provide only a ranked 3-step plan with timeline.
- In section 8, provide conditional score ranges only (never guarantees).
- In section 9, provide 3-5 tailored warnings.
- In section 10, give current position, realistic 6-month outlook, and best path forward.
- No guaranteed outcomes. No vague generic filler.

User score input: ${score ?? 'Unknown'}
Goal profile: ${JSON.stringify(profile, null, 2)}
Financial context: ${JSON.stringify(financialContext, null, 2)}
Derived financial math:
- Annual income: ${annualIncome ?? 'Unknown'}
- Monthly income: ${monthlyIncome != null ? monthlyIncome.toFixed(2) : 'Unknown'}
- Monthly debt payments: ${monthlyDebt ?? 'Unknown'}
- DTI: ${dtiPercent != null ? `${dtiPercent}%` : 'Unknown'}
- User-declared total revolving limit: ${declaredTotalCreditLimit ?? 'Unknown'}

Credit report text:
${text}`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a consumer credit strategy analyst. You only respond with valid JSON and follow the required 10-section credit strategy report format exactly.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 2200,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      logger.error('LLM request failed', { status: response.status, body: await response.text() });
      res.status(502).json({ error: 'The analysis service is busy. Please try again.' });
      return;
    }

    const data = await response.json();
    const rawContent = data && data.choices && data.choices[0] && data.choices[0].message
      ? String(data.choices[0].message.content || '').trim()
      : '';

    let result = null;
    try {
      result = JSON.parse(rawContent);
    } catch {
      result = null;
    }

    const adviceFromResult = result && typeof result.strategy_report_markdown === 'string'
      ? result.strategy_report_markdown
      : '';
    const advice = adviceFromResult || rawContent;

    res.status(200).json({ advice, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error('creditReportAnalyze function error', { message, stack });
    res.status(500).json({ error: 'Unexpected server error.' });
  }
});
