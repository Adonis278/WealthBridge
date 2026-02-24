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

    const prompt = `You are a helpful financial coach. Analyze the provided credit report text and return concise, actionable advice.\n\nReturn the response in Markdown with the following sections:\n- Summary (2-3 sentences)\n- Key red flags (bullets)\n- Recommendations (5-7 bullets)\n- 3 credit-building options (numbered list)\n- 3-6 month score projection (short paragraph)\n\nRequirements:\n- Mention any red flags and how to resolve them.\n- If a score is provided, tailor advice to the score range.\n- Include a projection of how the score could change in 3-6 months if the user follows the plan.\n- Provide up to 3 clear options for credit-building paths (example: secured card, credit builder loan, rent reporting).\n- Keep the tone supportive and professional.\n- Consider the user profile answers when crafting advice.\n\nScore: ${score ?? 'Unknown'}\n\nUser profile:\n${JSON.stringify(profile, null, 2)}\n\nReport text:\n${text}`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a certified credit counselor.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 450,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'LLM request failed.', details: errorText }, { status: 502 });
    }

    const data = await response.json();
    const advice = data?.choices?.[0]?.message?.content?.trim() ?? '';

    if (reportId && advice) {
      await addDoc(collection(db, 'creditReportAdvice'), {
        reportId,
        advice,
        createdAt: serverTimestamp(),
      });
    }

    return NextResponse.json({ advice });
  } catch (error) {
    console.error('LLM analyze route error:', error);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
