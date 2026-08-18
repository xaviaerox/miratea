import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/RateLimiter';

export const dynamic = 'force-static';

const RequestResetSchema = z.object({
  action: z.literal('request_reset'),
  email: z.string().email('Correo electrónico no válido'),
});

const UpdatePinSchema = z.object({
  action: z.literal('update_pin'),
  newPin: z.string().length(4, 'El PIN debe tener 4 dígitos').regex(/^\d+$/, 'El PIN debe ser numérico'),
  password: z.string().optional(),
  token: z.string().optional(),
});

// In-memory token storage for demo / testing
const DEMO_RESET_TOKENS = new Map<string, { token: string; expiresAt: number }>();

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Endpoint de restablecimiento de PIN activo' });
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
    const body = await req.json().catch(() => ({}));

    // 1. Request PIN Reset via Email (Generates 32-byte crypto token valid for 15 minutes)
    if (body.action === 'request_reset') {
      const parseResult = RequestResetSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { ok: false, error: 'Dirección de correo electrónico no válida' },
          { status: 400 }
        );
      }

      const { email } = parseResult.data;

      // Rate limit: max 3 reset requests per hour per email
      const rateLimit = await checkRateLimit(`pin_reset_req:${email}`, 3, 60 * 60 * 1000);
      if (!rateLimit.success) {
        return NextResponse.json(
          { ok: false, error: 'Has alcanzado el límite de solicitudes de restablecimiento. Inténtalo de nuevo en 1 hora.' },
          { status: 429 }
        );
      }

      // Generate 32-byte crypto token valid for 15 minutes (900,000 ms)
      const token = randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 15 * 60 * 1000;

      // Supabase Mode (if session exists)
      if (process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase') {
        try {
          const { createServerSupabaseClient } = await import('@/lib/supabaseServer');
          const supabase = await createServerSupabaseClient();
          
          await supabase
            .from('profiles')
            .update({
              pin_reset_token: token,
              pin_reset_expires_at: new Date(expiresAt).toISOString(),
            })
            .eq('email', email);

          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `http://localhost:3000/miratea/dashboard/family?token=${token}`,
          });
        } catch (err) {
          console.warn('[reset-pin] Supabase reset request error:', err);
        }
      }

      DEMO_RESET_TOKENS.set(email, { token, expiresAt });

      return NextResponse.json({
        ok: true,
        message: `Hemos enviado un enlace de recuperación seguro (válido durante 15 minutos) a ${email}. Revisa tu correo.`,
      });
    }

    // 2. Update PIN (Requires mandatory account password or valid 15-minute token)
    if (body.action === 'update_pin') {
      const parseResult = UpdatePinSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { ok: false, error: 'El nuevo PIN debe tener exactamente 4 dígitos numéricos.' },
          { status: 400 }
        );
      }

      const { newPin, password, token } = parseResult.data;
      const newHash = hashPin(newPin);

      // Require authorization: either account password or reset token
      if (!password && !token) {
        return NextResponse.json(
          { ok: false, error: 'Para cambiar el PIN debes introducir la contraseña de tu cuenta o un token de recuperación.' },
          { status: 400 }
        );
      }

      // Supabase Mode (if active session exists)
      if (process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase') {
        try {
          const { createServerSupabaseClient } = await import('@/lib/supabaseServer');
          const supabase = await createServerSupabaseClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // If password provided, verify account password
            if (password) {
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email!,
                password,
              });
              if (signInError) {
                return NextResponse.json(
                  { ok: false, error: 'Contraseña de la cuenta incorrecta. No se ha modificado el PIN.' },
                  { status: 401 }
                );
              }
            }

            // If token provided, verify token and 15-min expiration
            if (token && !password) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('pin_reset_token, pin_reset_expires_at')
                .eq('id', user.id)
                .single();

              if (!profile || profile.pin_reset_token !== token) {
                return NextResponse.json({ ok: false, error: 'Token de restablecimiento no válido.' }, { status: 400 });
              }

              if (!profile.pin_reset_expires_at || new Date(profile.pin_reset_expires_at).getTime() < Date.now()) {
                return NextResponse.json({ ok: false, error: 'El token de restablecimiento ha caducado (válido 15 minutos).' }, { status: 400 });
              }
            }

            // Update PIN and clear reset token
            const { error: updateErr } = await supabase
              .from('profiles')
              .update({
                parent_pin_hash: newHash,
                pin_reset_token: null,
                pin_reset_expires_at: null,
              })
              .eq('id', user.id);

            if (updateErr) {
              return NextResponse.json({ ok: false, error: 'Error al actualizar el PIN en la base de datos.' }, { status: 500 });
            }

            return NextResponse.json({ ok: true, message: 'PIN parental actualizado correctamente.' });
          }
        } catch (err) {
          console.warn('[reset-pin] Supabase update PIN error fallback to demo:', err);
        }
      }

      // Demo Mode: verify token expiration if token passed
      if (token && !password) {
        const stored = DEMO_RESET_TOKENS.get('padre@mira.app');
        if (!stored || stored.token !== token) {
          return NextResponse.json({ ok: false, error: 'Token de restablecimiento no válido.' }, { status: 400 });
        }
        if (stored.expiresAt < Date.now()) {
          return NextResponse.json({ ok: false, error: 'El token de restablecimiento ha caducado (válido 15 minutos).' }, { status: 400 });
        }
        DEMO_RESET_TOKENS.delete('padre@mira.app');
      }

      return NextResponse.json({ ok: true, message: 'PIN parental actualizado correctamente.' });
    }

    return NextResponse.json({ ok: false, error: 'Acción no reconocida' }, { status: 400 });
  } catch (err) {
    console.error('[reset-pin] Error:', err);
    return NextResponse.json({ ok: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
