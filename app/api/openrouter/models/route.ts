import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      console.error('OPENROUTER_API_KEY not set for /api/openrouter/models');
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured' }, { status: 500 });
    }

    console.log('Fetching OpenRouter models list');

    const resp = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await resp.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { raw: text };
    }

    return NextResponse.json({ status: resp.status, data }, { status: resp.status });
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
