import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/RateLimiter';

const VerifyPinSchema = z.object({
  pin: z.string().length(4, 'El PIN debe tener exactamente 4 dígitos').regex(/^\d+$/, 'El PIN debe ser numérico'),
});

// SHA-256 helper
export function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
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

    // 2. Supabase Mode
    if (process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase') {
      try {
        const { createServerSupabaseClient } = await import('@/lib/supabaseServer');
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, parent_pin_hash')
          .eq('id', user.id)
          .single();

        if (error || !profile) {
          return NextResponse.json({ ok: false, error: 'Perfil no encontrado' }, { status: 404 });
        }

        if (profile.role !== 'parent') {
          return NextResponse.json({ ok: false, error: 'Solo perfiles parentales pueden realizar esta acción' }, { status: 403 });
        }

        // If no PIN set, prompt onboarding setup (never bypass silently!)
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
      } catch (err) {
        console.warn('[verify-pin] Supabase client check error:', err);
      }
    }

    // 3. Static / Demo Mode
    if (inputHash === defaultDemoHash) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'PIN incorrecto. Inténtalo de nuevo.' }, { status: 401 });
  } catch (err) {
    console.error('[verify-pin] Error:', err);
    return NextResponse.json({ ok: false, error: 'Error al verificar el PIN' }, { status: 500 });
  }
}
