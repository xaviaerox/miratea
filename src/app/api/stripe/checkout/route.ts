import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe, isStripeConfigured, PLAN_CONFIG } from '@/lib/stripe/stripe';

export const dynamic = 'force-static';

const CheckoutSchema = z.object({
  plan: z.enum(['monthly', 'annual']),
  familyId: z.string().optional(),
  returnUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Parámetros de checkout no válidos' },
        { status: 400 }
      );
    }

    const { plan, returnUrl } = parsed.data;
    let familyId = parsed.data.familyId;
    let userEmail = 'familia@miratea.es';

    // Attempt to resolve real user session if Supabase is active
    try {
      const { createServerSupabaseClient } = await import('@/lib/supabaseServer');
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        userEmail = user.email || userEmail;
        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id, role')
          .eq('id', user.id)
          .single();

        if (profile?.family_id) {
          familyId = profile.family_id;
        }
      }
    } catch {
      // In static / demo mode, proceed with mock session
    }

    const origin = req.nextUrl.origin || 'https://miratea.es';
    const successUrl = returnUrl || `${origin}/dashboard/family?subscription=success&plan=${plan}`;
    const cancelUrl = returnUrl || `${origin}/dashboard/family?subscription=cancel`;

    // 1. Live Stripe Mode
    if (isStripeConfigured()) {
      const stripe = getStripe();
      if (!stripe) {
        return NextResponse.json(
          { ok: false, error: 'Stripe no se pudo inicializar' },
          { status: 500 }
        );
      }

      const planDetails = PLAN_CONFIG[plan];

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: planDetails.currency,
              product_data: {
                name: planDetails.name,
                description:
                  'Acceso ilimitado a IA de micropasos, relatos de Lumi y exportación de informes terapéuticos.',
              },
              unit_amount: planDetails.amount,
              recurring: {
                interval: planDetails.interval,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          familyId: familyId || 'demo-family',
          plan,
        },
        client_reference_id: familyId || 'demo-family',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return NextResponse.json({ ok: true, url: session.url });
    }

    // 2. Demo / Simulated Fallback Mode
    return NextResponse.json({
      ok: true,
      url: returnUrl || `${origin}/dashboard/family?subscription=simulated_success&plan=${plan}`,
      simulated: true,
      message: 'Modo simulación de Stripe activado (entorno de pruebas local)',
    });
  } catch (err) {
    console.error('[StripeCheckout] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Error al iniciar la pasarela de suscripción' },
      { status: 500 }
    );
  }
}
