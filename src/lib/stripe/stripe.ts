import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export function isStripeConfigured(): boolean {
  return (
    !!stripeSecretKey &&
    !stripeSecretKey.includes('placeholder') &&
    stripeSecretKey.startsWith('sk_')
  );
}

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!isStripeConfigured()) return null;
  if (!stripeInstance && stripeSecretKey) {
    stripeInstance = new Stripe(stripeSecretKey);
  }
  return stripeInstance;
}

export interface CreateCheckoutParams {
  familyId: string;
  userEmail: string;
  plan: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePortalParams {
  customerId: string;
  returnUrl: string;
}

export const PLAN_CONFIG = {
  monthly: {
    name: 'MIRATEA Familiar Mensual',
    amount: 499, // 4.99 EUR in cents
    currency: 'eur',
    interval: 'month' as const,
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY || 'price_miratea_monthly',
  },
  annual: {
    name: 'MIRATEA Familiar Anual (-20%)',
    amount: 3999, // 39.99 EUR in cents (approx 3.33/mo)
    currency: 'eur',
    interval: 'year' as const,
    priceId: process.env.STRIPE_PRICE_ID_ANNUAL || 'price_miratea_annual',
  },
};
