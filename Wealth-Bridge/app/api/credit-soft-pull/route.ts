import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = typeof body?.userId === 'string' ? body.userId : undefined;

    if (!userId) {
      return NextResponse.json({ error: 'Missing user id.' }, { status: 400 });
    }

    const apiKey = process.env.EXPERIAN_API_KEY;
    const apiSecret = process.env.EXPERIAN_API_SECRET;
    const apiBaseUrl = process.env.EXPERIAN_API_BASE_URL;

    if (!apiKey || !apiSecret || !apiBaseUrl) {
      return NextResponse.json(
        { error: 'Experian integration not configured.' },
        { status: 501 },
      );
    }

    return NextResponse.json(
      {
        message: 'Experian soft pull is configured but not yet implemented. Add your request flow here.',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Soft pull route error:', error);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}