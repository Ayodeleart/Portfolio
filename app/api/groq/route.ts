import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { title, notes, tech } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You write short, confident portfolio project descriptions for a developer/artist named Octopus Fur. 2-3 sentences, no fluff, no marketing cliches, plain direct language.',
        },
        {
          role: 'user',
          content: `Project title: ${title}\nRaw notes: ${notes || 'none'}\nTech stack: ${(tech || []).join(', ')}\n\nWrite the project description.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ description: text });
  } catch (err) {
    console.error('Groq error:', err);
    return NextResponse.json({ error: 'generation failed' }, { status: 500 });
  }
}
