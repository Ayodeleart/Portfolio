import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { title, field, text } = await req.json();

    if (!text || !field) {
      return NextResponse.json({ error: 'text and field are required' }, { status: 400 });
    }

    const fieldLabel = field === 'inspiration' ? 'inspiration note' : 'story';

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You polish an artist\'s rough notes about a piece of art into a short, evocative, plainly-written ' +
            `${fieldLabel} for a gallery website. Keep their voice and every specific detail they mention — ` +
            'do not invent new facts about the piece. 2-4 sentences. No purple prose, no marketing cliches.',
        },
        {
          role: 'user',
          content: `Artwork title: ${title || 'Untitled'}\nRaw notes:\n${text}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 220,
    });

    const polished = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ polished });
  } catch (err) {
    console.error('Groq polish error:', err);
    return NextResponse.json({ error: 'generation failed' }, { status: 500 });
  }
}
