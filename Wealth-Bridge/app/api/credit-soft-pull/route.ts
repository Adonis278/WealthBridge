import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/verifyAuth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // The caller's identity comes from the verified token, never from the body.
    const caller = await verifyRequest(request);
    if (!caller) {
      return NextResponse.json({ error: 'Sign in to request a soft pull.' }, { status: 401 });
    }

    const apiKey = process.env.EXPERIAN_API_KEY;
    const apiSecret = process.env.EXPERIAN_API_SECRET;
    const apiBaseUrl = process.env.EXPERIAN_API_BASE_URL;

    if (!apiKey || !apiSecret || !apiBaseUrl) {
      return NextResponse.json(
        { error: 'Bureau integration is not enabled yet.' },
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
