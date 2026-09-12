import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/stripe';
import type Stripe from 'stripe';
import type { Database } from '@/types/database.types';

type SubscriptionStatus = Database['public']['Tables']['family_subscriptions']['Row']['status'];

function toSubscriptionStatus(status: string): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'past_due':
    case 'incomplete':
      return status;
    default:
      return 'canceled';
  }
}

export const dynamic = 'force-static';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  // 1. Signature Verification
  if (stripe && webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[StripeWebhook] Error verificando firma:', message);
      return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
    }
  } else {
    // If testing without webhook secret or in development
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Payload JSON inválido' }, { status: 400 });
    }
  }

  // 2. Event Dispatching
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabaseServer');
    const supabase = await createServerSupabaseClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const familyId = session.metadata?.familyId || session.client_reference_id;
        const plan = session.metadata?.plan || 'premium_monthly';
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (familyId && familyId !== 'demo-family') {
          await supabase
            .from('family_subscriptions')
            .upsert({
              family_id: familyId,
              plan: plan === 'annual' ? 'premium_annual' : 'premium_monthly',
              status: 'active',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const subData = sub as unknown as { current_period_end?: number };
        const status = toSubscriptionStatus(sub.status);
        const customerId = sub.customer as string;

        await supabase
          .from('family_subscriptions')
          .update({
            status,
            current_period_end: subData.current_period_end
              ? new Date(subData.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: sub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase
          .from('family_subscriptions')
          .update({
            status: 'canceled',
            plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      default:
        // Ignore unhandled event types cleanly
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[StripeWebhook] Error procesando evento:', err);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}
