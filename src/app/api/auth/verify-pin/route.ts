import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/RateLimiter';

export const dynamic = 'force-static';

const VerifyPinSchema = z.object({
  pin: z.string().length(4, 'El PIN debe tener exactamente 4 dígitos').regex(/^\d+$/, 'El PIN debe ser numérico'),
});

// SHA-256 helper
export function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Endpoint de verificación de PIN activo' });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
    
    // 1. Brute-force protection: Max 5 failed attempts per 15 minutes (900,000 ms)
    const rateLimit = await checkRateLimit(`pin_verify:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      const resetInMinutes = Math.ceil((rateLimit.resetMs - Date.now()) / (60 * 1000));
      return NextResponse.json(
        {
          ok: false,
          error: `Demasiados intentos fallidos. Acceso bloqueado temporalmente durante ${resetInMinutes} minutos por seguridad.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = VerifyPinSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: 'PIN con formato no válido. Debe tener 4 dígitos numéricos.' },
        { status: 400 }
      );
    }

    const { pin } = parseResult.data;
    const inputHash = hashPin(pin);
    const defaultDemoHash = hashPin('1234');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasSupabaseCreds = !!url && !!key && !url.includes('placeholder') && key !== 'placeholder';

    // 2. Supabase Mode (if session exists)
    if (process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase' && hasSupabaseCreds) {
      try {
        const { createServerSupabaseClient } = await import('@/lib/supabaseServer');
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, parent_pin_hash')
            .eq('id', user.id)
            .single();

          if (profile) {
            if (profile.role !== 'parent') {
              return NextResponse.json({ ok: false, error: 'Solo perfiles parentales pueden realizar esta acción' }, { status: 403 });
            }

            // If no PIN set in DB, prompt onboarding setup (never bypass silently!)
            if (!profile.parent_pin_hash) {
              return NextResponse.json(
                {
                  ok: false,
                  requireSetup: true,
                  error: 'Debes configurar tu PIN parental de 4 dígitos por primera vez antes de continuar.',
                },
                { status: 400 }
              );
            }

            if (inputHash === profile.parent_pin_hash) {
              return NextResponse.json({ ok: true });
            } else {
              return NextResponse.json({ ok: false, error: 'PIN incorrecto. Inténtalo de nuevo.' }, { status: 401 });
            }
          }
        }
      } catch (err) {
        console.warn('[verify-pin] Supabase client check fallback to demo mode:', err);
      }
    }

    // 3. Static / Demo Mode Fallback
    if (inputHash === defaultDemoHash) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'PIN incorrecto. Inténtalo de nuevo.' }, { status: 401 });
  } catch (err) {
    console.error('[verify-pin] Error:', err);
    return NextResponse.json({ ok: false, error: 'Error al verificar el PIN' }, { status: 500 });
  }
}
