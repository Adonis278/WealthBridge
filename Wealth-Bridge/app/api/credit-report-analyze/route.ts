import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

function getEnv(name: string): string | undefined {
  return process.env[name];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text : '';
    const score = typeof body?.score === 'number' ? body.score : undefined;

    if (!text) {
      return NextResponse.json({ error: 'Missing report text.' }, { status: 400 });
    }

    const apiKey = getEnv('LLM_API_KEY') || getEnv('OPENAI_API_KEY');
    const baseUrl = getEnv('LLM_BASE_URL') || DEFAULT_BASE_URL;
    const model = getEnv('LLM_MODEL') || DEFAULT_MODEL;

    if (!apiKey) {
      return NextResponse.json({ error: 'LLM API key not configured.' }, { status: 500 });
    }

    const prompt = `You are a helpful financial coach. Analyze the provided credit report text and return concise, actionable advice.\n\nRequirements:\n- Provide 5-7 bullet recommendations.\n- Mention any red flags and how to resolve them.\n- If a score is provided, tailor advice to the score range.\n- Keep the tone supportive and professional.\n\nScore: ${score ?? 'Unknown'}\n\nReport text:\n${text}`;

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

    return NextResponse.json({ advice });
  } catch (error) {
    console.error('LLM analyze route error:', error);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
