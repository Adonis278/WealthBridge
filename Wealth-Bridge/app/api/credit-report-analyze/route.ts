import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

function getEnv(name: string): string | undefined {
  return process.env[name];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text : '';
    const score = typeof body?.score === 'number' ? body.score : undefined;
    const reportId = typeof body?.reportId === 'string' ? body.reportId : undefined;
    const userId = typeof body?.userId === 'string' ? body.userId : undefined;
    const profile = body?.profile ?? {};

    if (!text) {
      return NextResponse.json({ error: 'Missing report text.' }, { status: 400 });
    }

    const apiKey = getEnv('LLM_API_KEY') || getEnv('OPENAI_API_KEY');
    const baseUrl = getEnv('LLM_BASE_URL') || DEFAULT_BASE_URL;
    const model = getEnv('LLM_MODEL') || DEFAULT_MODEL;

    if (!apiKey) {
      return NextResponse.json({ error: 'LLM API key not configured.' }, { status: 500 });
    }

    const financialContext = body?.financialContext ?? {};
    const prompt = `You are a certified credit strategy engine. Analyze the credit report and financial context provided. Return ONLY valid JSON — no explanations, no markdown code blocks, no extra text outside the JSON.

Return JSON exactly matching this schema:
{
  "credit_summary": {
    "current_score": <number, use detected score or estimate>,
    "score_band": <"Poor"|"Fair"|"Good"|"Very Good"|"Exceptional">,
    "projected_score": <number, realistic 6-month projection if user follows plan>,
    "projection_timeline_months": <number>
  },
  "factor_analysis": {
    "payment_history": { "current": <0-100>, "ideal": 100, "impact_level": <"High"|"Medium"|"Low">, "estimated_score_gain": "<range> points", "recommendation": "<action>" },
    "utilization": { "current": <0-100>, "ideal": 30, "impact_level": "High", "estimated_score_gain": "<range> points", "recommendation": "<action>" },
    "credit_age": { "current": <0-100>, "ideal": 80, "impact_level": "Medium", "estimated_score_gain": "<range> points", "recommendation": "<action>" },
    "credit_mix": { "current": <0-100>, "ideal": 70, "impact_level": "Low", "estimated_score_gain": "<range> points", "recommendation": "<action>" },
    "new_credit": { "current": <0-100>, "ideal": 80, "impact_level": "Low", "estimated_score_gain": "<range> points", "recommendation": "<action>" }
  },
  "goal_alignment": {
    "readiness_score_percent": <0-100>,
    "dti_percent": <number or null>,
    "notes": "<1-2 sentence goal readiness note>"
  },
  "risk_alerts": ["<alert string>", ...],
  "action_plan": [
    { "phase": "Month 1-2", "steps": ["<step>", ...] },
    { "phase": "Month 3-4", "steps": ["<step>", ...] },
    { "phase": "Month 5-6", "steps": ["<step>", ...] }
  ]
}

Score: ${score ?? 'Unknown'}
Goal: ${JSON.stringify(profile, null, 2)}
Financial Context: ${JSON.stringify(financialContext, null, 2)}
Report text:
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
          { role: 'system', content: 'You are a certified credit strategy engine. You only respond with valid JSON. No extra text.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1400,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'LLM request failed.', details: errorText }, { status: 502 });
    }

    const data = await response.json();
    const advice = data?.choices?.[0]?.message?.content?.trim() ?? '';

    // Parse JSON result; fall back gracefully
    let result: Record<string, unknown> | null = null;
    try {
      result = JSON.parse(advice);
    } catch {
      result = null;
    }

    if (advice) {
      await addDoc(collection(db, 'creditAnalysisResults'), {
        reportId: reportId ?? null,
        userId: userId ?? null,
        result,
        advice,
        score: (result as any)?.credit_summary?.current_score ?? null,
        projectedScore: (result as any)?.credit_summary?.projected_score ?? null,
        createdAt: serverTimestamp(),
      });
    }

    return NextResponse.json({ advice, result });
  } catch (error) {
    console.error('LLM analyze route error:', error);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
