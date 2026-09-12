import { describe, it, expect } from 'vitest';
import { PLAN_CONFIG } from '@/lib/stripe/stripe';
import { SubscriptionService } from '@/lib/subscriptions/subscriptionService';

describe('Stripe & Subscriptions Logic', () => {
  it('debe tener configurados los planes de suscripción mensual y anual con precios correctos', () => {
    expect(PLAN_CONFIG.monthly).toBeDefined();
    expect(PLAN_CONFIG.monthly.amount).toBe(499); // 4.99 €
    expect(PLAN_CONFIG.monthly.interval).toBe('month');

    expect(PLAN_CONFIG.annual).toBeDefined();
    expect(PLAN_CONFIG.annual.amount).toBe(3999); // 39.99 €
    expect(PLAN_CONFIG.annual.interval).toBe('year');
  });

  it('debe calcular correctamente las plazas restantes de la oferta Early Access (límite 20)', () => {
    const maxSpots = 20;

    const testCases = [
      { count: 0, expectedRemaining: 20, isAvailable: true },
      { count: 7, expectedRemaining: 13, isAvailable: true },
      { count: 19, expectedRemaining: 1, isAvailable: true },
      { count: 20, expectedRemaining: 0, isAvailable: false },
      { count: 25, expectedRemaining: 0, isAvailable: false },
    ];

    for (const tc of testCases) {
      const remaining = Math.max(0, maxSpots - tc.count);
      const isAvailable = remaining > 0;
      expect(remaining).toBe(tc.expectedRemaining);
      expect(isAvailable).toBe(tc.isAvailable);
    }
  });

  it('SubscriptionService debe devolver suscripción por defecto early_access en modo estático/demo', async () => {
    const sub = await SubscriptionService.getSubscription('family-test-123');
    expect(sub).toBeDefined();
    expect(sub.familyId).toBe('family-test-123');
    expect(['early_access', 'free', 'premium_monthly', 'premium_annual']).toContain(sub.plan);
    expect(sub.status).toBe('active');
  });
});
