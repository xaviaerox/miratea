import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/stripe';

export const dynamic = 'force-static';

export async function POST(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || 'https://miratea.es';
    const returnUrl = `${origin}/dashboard/family`;

    let customerId: string | null = null;

    try {
      const { createServerSupabaseClient } = await import('@/lib/supabaseServer');
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', user.id)
          .single();

        if (profile?.family_id) {
          const { data: sub } = await supabase
            .from('family_subscriptions')
            .select('stripe_customer_id')
            .eq('family_id', profile.family_id)
            .single();

          customerId = sub?.stripe_customer_id || null;
        }
      }
    } catch {
      // Demo / static fallback
    }

    if (isStripeConfigured() && customerId) {
      const stripe = getStripe();
      if (!stripe) {
        return NextResponse.json({ ok: false, error: 'Stripe no disponible' }, { status: 500 });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return NextResponse.json({ ok: true, url: portalSession.url });
    }

    // Simulated / Demo portal mode
    return NextResponse.json({
      ok: true,
      url: `${returnUrl}?portal=simulated`,
      simulated: true,
      message: 'Portal de facturación simulado (Modo Demo)',
    });
  } catch (err) {
    console.error('[StripePortal] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Error al abrir el portal de cliente' },
      { status: 500 }
    );
  }
}
