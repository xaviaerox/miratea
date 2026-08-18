import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';

const VerifyPinSchema = z.object({
  pin: z.string().length(4, 'El PIN debe tener exactamente 4 dígitos').regex(/^\d+$/, 'El PIN debe ser numérico'),
});

// SHA-256 helper
export function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = VerifyPinSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: 'PIN con formato no válido. Debe tener 4 dígitos.' },
        { status: 400 }
      );
    }

    const { pin } = parseResult.data;
    const inputHash = hashPin(pin);
    const defaultDemoHash = hashPin('1234'); // '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'

    // 1. Supabase Mode
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

        const expectedHash = profile.parent_pin_hash || defaultDemoHash;
        if (inputHash === expectedHash) {
          return NextResponse.json({ ok: true });
        } else {
          return NextResponse.json({ ok: false, error: 'PIN incorrecto. Inténtalo de nuevo.' }, { status: 401 });
        }
      } catch (err) {
        console.warn('[verify-pin] Supabase client import failed, falling back to static check:', err);
      }
    }

    // 2. Static / Demo Mode
    if (inputHash === defaultDemoHash) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'PIN incorrecto. Inténtalo de nuevo.' }, { status: 401 });
  } catch (err) {
    console.error('[verify-pin] Error:', err);
    return NextResponse.json({ ok: false, error: 'Error al verificar el PIN' }, { status: 500 });
  }
}
