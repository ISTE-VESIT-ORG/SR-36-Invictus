// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const { event } = await req.json();
//     if (!event || !event.name || !event.description) {
//       return NextResponse.json({ error: 'Missing event data' }, { status: 400 });
//     }

//     // Compose prompt for OpenRouter with all available event info
//     const prompt = `Given the following event information, generate three sections: 1. About This Event (detailed explanation), 2. Why It Matters (astronomical/scientific significance), 3. Observation Tips (practical advice for observers).\n\n` +
//       `Event Name: ${event.name}\n` +
//       `Description: ${event.description?.detailed || event.description?.simple || ''}\n` +
//       `Type: ${event.type}\n` +
//       `Date: ${event.date}\n` +
//       `Peak Time: ${event.peakTime || ''}\n` +
//       `Duration: ${event.duration ? event.duration + ' minutes' : ''}\n` +
//       `Location: ${event.visibility?.location || ''}\n` +
//       `Coordinates: ${event.visibility?.coordinates ? `lat: ${event.visibility.coordinates?.lat}, lng: ${event.visibility.coordinates?.lng}` : ''}\n` +
//       `Best View Time: ${event.visibility?.bestViewTime || ''}\n` +
//       `Direction: ${event.visibility?.direction || ''}\n` +
//       `Visibility Score: ${event.visibility?.visibilityScore || ''}\n` +
//       `Weather Dependent: ${event.weatherDependent ? 'Yes' : 'No'}\n` +
//       `Images: ${event.images?.length ? event.images.join(', ') : 'None'}\n` +
//       `Why It Matters (original): ${event.whyItMatters || ''}\n` +
//       `Observation Tips (original): ${event.observationTips?.length ? event.observationTips.join('; ') : ''}\n` +
//       `\nRespond in JSON with keys: about, whyItMatters, observationTips (array of strings).`;

//     // Call OpenRouter API
//     const apiKey = process.env.OPENROUTER_API_KEY;
//     if (!apiKey) {
//       return NextResponse.json({ error: 'Missing OpenRouter API key' }, { status: 500 });
//     }

//     try {
//       const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${apiKey}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           model: 'openai/gpt-4o-mini',
//           messages: [
//             { role: 'system', content: 'You are an expert science communicator.' },
//             { role: 'user', content: prompt },
//           ],
//           max_tokens: 600,
//           temperature: 0.8,
//         }),
//       });

//       if (!response.ok) {
//         const error = await response.text();
//         console.error('OpenRouter API error:', error);
//         return NextResponse.json({ error }, { status: 500 });
//       }

//       const data = await response.json();
//       // Try to parse the JSON from the AI's response, even if extra text is present
//       let aiContent = null;
//       try {
//         const text = data.choices?.[0]?.message?.content || '';
//         // Extract JSON from text (robust to extra explanation)
//         const match = text.match(/\{[\s\S]*\}/);
//         if (match) {
//           aiContent = JSON.parse(match[0]);
//         } else {
//           throw new Error('No JSON object found in AI response');
//         }
//       } catch (e) {
//         console.error('Failed to parse AI response:', data);
//         return NextResponse.json({ error: 'Failed to parse AI response', raw: data }, { status: 500 });
//       }

//       return NextResponse.json({ ...aiContent });
//     } catch (err) {
//       console.error('Error in OpenRouter fetch or parsing:', err);
//       return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
//     }
//   }
//   catch (err) {
//     console.error('Error in AI event details API:', err);
//     return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
//   }

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { event } = await req.json();

    // Validate input
    if (!event || !event.name || !event.description) {
      return NextResponse.json(
        { error: 'Missing event data' },
        { status: 400 }
      );
    }

    // Build prompt
    const prompt =
      `Given the following event information, generate three sections: 
1. About This Event (detailed explanation), 
2. Why It Matters (astronomical/scientific significance), 
3. Observation Tips (practical advice for observers).\n\n` +

      `Event Name: ${event.name}\n` +
      `Description: ${event.description?.detailed || event.description?.simple || ''}\n` +
      `Type: ${event.type || ''}\n` +
      `Date: ${event.date || ''}\n` +
      `Peak Time: ${event.peakTime || ''}\n` +
      `Duration: ${event.duration ? event.duration + ' minutes' : ''}\n` +
      `Location: ${event.visibility?.location || ''}\n` +
      `Coordinates: ${
        event.visibility?.coordinates
          ? `lat: ${event.visibility.coordinates?.lat}, lng: ${event.visibility.coordinates?.lng}`
          : ''
      }\n` +
      `Best View Time: ${event.visibility?.bestViewTime || ''}\n` +
      `Direction: ${event.visibility?.direction || ''}\n` +
      `Visibility Score: ${event.visibility?.visibilityScore || ''}\n` +
      `Weather Dependent: ${event.weatherDependent ? 'Yes' : 'No'}\n` +
      `Images: ${event.images?.length ? event.images.join(', ') : 'None'}\n` +
      `Why It Matters (original): ${event.whyItMatters || ''}\n` +
      `Observation Tips (original): ${
        event.observationTips?.length ? event.observationTips.join('; ') : ''
      }\n` +
      `\nRespond in JSON with keys: about, whyItMatters, observationTips (array of strings).`;

    // Get API key
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OpenRouter API key' },
        { status: 500 }
      );
    }

    // ---------- INNER TRY (OpenRouter call) ----------
    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert science communicator.',
              },
              { role: 'user', content: prompt },
            ],
            max_tokens: 600,
            temperature: 0.8,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenRouter API error:', error);

        return NextResponse.json(
          { error },
          { status: 500 }
        );
      }

      const data = await response.json();

      // Extract JSON from AI response safely
      let aiContent = null;

      try {
        const text = data.choices?.[0]?.message?.content || '';

        // Extract JSON even if extra text exists
        const match = text.match(/\{[\s\S]*\}/);

        if (match) {
          aiContent = JSON.parse(match[0]);
        } else {
          throw new Error('No JSON found in AI response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', data);

        return NextResponse.json(
          { error: 'Failed to parse AI response', raw: data },
          { status: 500 }
        );
      }

      return NextResponse.json({ ...aiContent });

    } catch (err) {
      console.error('Error during OpenRouter request:', err);

      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // ---------- END INNER TRY ----------

  } catch (outerErr) {
    console.error('POST handler error:', outerErr);

    return NextResponse.json(
      { error: outerErr instanceof Error ? outerErr.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
