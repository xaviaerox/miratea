import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/RateLimiter';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-static';

import { sanitizePii, restorePii } from '@/lib/security/PiiSanitizer';

const DecomposeSchema = z.object({
  prompt: z.string().min(1, 'El prompt no puede estar vacío').max(1000, 'Prompt demasiado largo'),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting (max 10 requests/min per IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
    const rateLimit = await checkRateLimit(`decompose:${ip}`, 10, 60000);

    if (!rateLimit.success) {
      const resetInSeconds = Math.ceil((rateLimit.resetMs - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Demasiadas peticiones. Intenta de nuevo en ${resetInSeconds} segundos.` },
        { status: 429 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasSupabaseCreds = !!url && !!key && !url.includes('placeholder') && key !== 'placeholder';

    // 2. Auth check in Supabase mode
    if (process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase' && hasSupabaseCreds) {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
    }

    // 3. Zod validation
    const body = await req.json().catch(() => ({}));
    const parseResult = DecomposeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Datos no válidos', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { prompt: rawPrompt } = parseResult.data;
    const { sanitizedText: prompt, replacements: piiReplacements } = sanitizePii(rawPrompt);

    // 4. Call Groq
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
        const groqPayload: Record<string, unknown> = {
          model: groqModel,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: parseInt(process.env.GROQ_DECOMPOSE_MAX_TOKENS || '4000', 10),
          temperature: 0.3,
          response_format: { type: 'json_object' },
        };

        if (process.env.GROQ_REASONING_EFFORT) {
          groqPayload.reasoning_effort = process.env.GROQ_REASONING_EFFORT;
        } else if (groqModel.includes('gpt-oss') || groqModel.includes('o1') || groqModel.includes('o3')) {
          groqPayload.reasoning_effort = 'low';
        }

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify(groqPayload),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data.choices?.[0]?.message?.content || '';
          const text = restorePii(rawText, piiReplacements);
          return NextResponse.json({ text });
        } else {
          console.error('[decompose] Groq API error:', res.status, await res.text());
        }
      } catch (err) {
        console.error('[decompose] Groq fetch error:', err);
      }
    }

    // 5. Fallback to Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                maxOutputTokens: 4000,
                temperature: 0.3,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const text = restorePii(rawText, piiReplacements);
          return NextResponse.json({ text });
        } else {
          console.error('[decompose] Gemini API error:', res.status, await res.text());
        }
      } catch (err) {
        console.error('[decompose] Gemini fetch error:', err);
      }
    }

    // 6. Fallback to Anthropic
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && anthropicKey !== 'tu-anthropic-key') {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (res.ok) {
          const data = await res.json() as { content?: Array<{ text?: string }> };
          const rawText = data.content?.[0]?.text || '';
          const text = restorePii(rawText, piiReplacements);
          return NextResponse.json({ text });
        } else {
          console.error('[decompose] Anthropic API error:', res.status, await res.text());
        }
      } catch (err) {
        console.error('[decompose] Anthropic fetch error:', err);
      }
    }

    // 7. Safe fallback JSON
    return NextResponse.json({ text: '{"microtasks":[]}' });
  } catch (err) {
    console.error('[decompose] General error:', err);
    return NextResponse.json({ text: '{"microtasks":[]}' });
  }
}
