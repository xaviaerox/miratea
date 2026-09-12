import { isUseSupabase } from '@/lib/adapters';
import { supabase } from '@/lib/supabase';
import { getApiUrl } from '@/lib/utils';

export type SubscriptionPlan = 'free' | 'early_access' | 'premium_monthly' | 'premium_annual';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

export interface FamilySubscription {
  familyId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export const SubscriptionService = {
  async getSubscription(familyId: string): Promise<FamilySubscription> {
    if (!isUseSupabase()) {
      if (typeof window !== 'undefined') {
        const storedPlan = (localStorage.getItem('mira_family_plan') as SubscriptionPlan) || 'early_access';
        const storedStatus = (localStorage.getItem('mira_family_sub_status') as SubscriptionStatus) || 'active';
        return {
          familyId,
          plan: storedPlan,
          status: storedStatus,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        };
      }
      return {
        familyId,
        plan: 'early_access',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }

    try {
      const { data, error } = await supabase
        .from('family_subscriptions')
        .select('*')
        .eq('family_id', familyId)
        .single();

      if (error || !data) {
        return {
          familyId,
          plan: 'early_access',
          status: 'active',
        };
      }

      return {
        familyId: data.family_id,
        plan: data.plan as SubscriptionPlan,
        status: data.status as SubscriptionStatus,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
      };
    } catch {
      return {
        familyId,
        plan: 'early_access',
        status: 'active',
      };
    }
  },

  async startCheckout(plan: 'monthly' | 'annual', familyId?: string): Promise<{ ok: boolean; url?: string; error?: string }> {
    try {
      const res = await fetch(getApiUrl('/api/stripe/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, familyId }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        return { ok: false, error: data?.error || 'Error al conectar con la pasarela de pagos' };
      }

      if (data.url) {
        window.location.href = data.url;
        return { ok: true, url: data.url };
      }

      return { ok: false, error: 'No se recibió la URL de pago' };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Error de red al procesar el pago' };
    }
  },

  async openCustomerPortal(): Promise<{ ok: boolean; url?: string; error?: string }> {
    try {
      const res = await fetch(getApiUrl('/api/stripe/portal'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        return { ok: false, error: data?.error || 'Error al abrir el portal de cliente' };
      }

      if (data.url) {
        window.location.href = data.url;
        return { ok: true, url: data.url };
      }

      return { ok: false, error: 'No se recibió la URL del portal' };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Error de red' };
    }
  },
};
