import { NextRequest, NextResponse } from 'next/server';

// Debug: module loaded
console.log('Loaded api/learning-content/route.ts');

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('POST /api/learning-content called');
        console.log('Request method:', request.method);
        const body = await request.json().catch((e) => {
            console.error('Failed to parse JSON body:', e);
            return null;
        });
        console.log('Request body:', body);
        const { moduleTitle, topics, level } = body || {};

        if (!moduleTitle) {
            return NextResponse.json(
                { error: 'Module title is required' },
                { status: 400 }
            );
        }

        const openRouterApiKey = process.env.OPENROUTER_API_KEY;

        if (!openRouterApiKey) {
            console.error('OPENROUTER_API_KEY is not configured');
            return NextResponse.json(
                { error: 'API configuration error' },
                { status: 500 }
            );
        }

        // Create a comprehensive prompt for educational content
        const prompt = `You are an expert space educator. Create comprehensive, engaging educational content about "${moduleTitle}".

Level: ${level || 'Beginner'}
Topics to cover: ${topics ? topics.join(', ') : 'All relevant aspects'}

Please provide:
1. A detailed introduction (2-3 paragraphs)
2. Key concepts explained in detail (at least 5 main points)
3. Interesting facts and real-world examples
4. Historical context and recent developments
5. Future implications or ongoing research
6. Interactive questions for learners to think about

Format the response in markdown with clear headings and structure. Make it engaging and suitable for the specified level.`;

        // Use OpenRouter Auto Router by default which routes to an available model
        const primaryModel = process.env.OPENROUTER_MODEL || 'openrouter/auto';
        const fallbackModel = process.env.OPENROUTER_FALLBACK_MODEL;

        async function makeOpenRouterRequest(model: string) {
            return fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterApiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                    'X-Title': 'AstroView Learning Platform',
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                }),
            });
        }

        let response = await makeOpenRouterRequest(primaryModel);
        const attemptedModels: string[] = [primaryModel];

        // If primary model not available and a fallback is provided, try fallback
        if (response.status === 404 && fallbackModel) {
            console.warn(`Primary model ${primaryModel} returned 404; trying fallback ${fallbackModel}`);
            attemptedModels.push(fallbackModel);
            response = await makeOpenRouterRequest(fallbackModel);
        }

        // If still 404 and a comma-separated list is provided, try those models sequentially
        if (response.status === 404 && !fallbackModel && process.env.OPENROUTER_TRY_MODELS) {
            const tryModels = process.env.OPENROUTER_TRY_MODELS.split(',').map(s => s.trim()).filter(Boolean);
            for (const m of tryModels) {
                if (attemptedModels.includes(m)) continue;
                console.warn(`Trying alternative model ${m}`);
                attemptedModels.push(m);
                response = await makeOpenRouterRequest(m);
                if (response.ok) break;
            }
        }

        if (!response.ok) {
            let errorData: any = null;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text().catch(() => 'No body') };
            }
            console.error('OpenRouter API error:', response.status, errorData);

            if (response.status === 404) {
                return NextResponse.json(
                    {
                        error: 'Model not available',
                        attemptedModels,
                        message: `Attempted models: ${attemptedModels.join(', ')}. Set OPENROUTER_MODEL or OPENROUTER_FALLBACK_MODEL to a valid model.`,
                        details: errorData,
                    },
                    { status: 502 }
                );
            }

            return NextResponse.json({ error: 'Failed to generate content', details: errorData }, { status: response.status });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return NextResponse.json(
                { error: 'No content generated' },
                { status: 500 }
            );
        }

        return NextResponse.json({ content });
    } catch (error) {
        console.error('Error generating learning content:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// Simple GET handler to help debug route availability in development
export async function GET() {
    try {
        return NextResponse.json({ message: 'Learning content API is reachable' }, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/learning-content:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Respond to preflight CORS and simple checks
export async function OPTIONS() {
    try {
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        } as Record<string,string>;
        return new NextResponse(null, { status: 204, headers });
    } catch (error) {
        console.error('Error in OPTIONS /api/learning-content:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
