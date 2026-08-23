import { describe, it, expect, beforeEach } from 'vitest';
import {
  analytics,
  validateAndSanitizeMetadata,
} from '../tracker';

describe('Anti-PII & Privacy Security Rules', () => {
  beforeEach(() => {
    analytics.clearQueue();
  });

  it('rejects keys containing name, email, phone, or clinical fields', () => {
    expect(() => validateAndSanitizeMetadata({ parent_name: 'Maria' })).toThrow(/Anti-PII Violation/);
    expect(() => validateAndSanitizeMetadata({ email: 'test@example.com' })).toThrow(/Anti-PII Violation/);
    expect(() => validateAndSanitizeMetadata({ phone_number: '600112233' })).toThrow(/Anti-PII Violation/);
    expect(() => validateAndSanitizeMetadata({ clinical_notes: 'Paciente con TEA' })).toThrow(/Anti-PII Violation/);
  });

  it('rejects values containing emails, phones, national IDs, or health terms', () => {
    expect(() => validateAndSanitizeMetadata({ contact: 'Contact me at user@test.org' })).toThrow(/Anti-PII Violation/);
    expect(() => validateAndSanitizeMetadata({ phone: '612345678' })).toThrow(/Anti-PII Violation/);
    expect(() => validateAndSanitizeMetadata({ id: '12345678Z' })).toThrow(/Anti-PII Violation/);
    expect(() => validateAndSanitizeMetadata({ info: 'Diagnostico de TDAH' })).toThrow(/Anti-PII Violation/);
    expect(() => validateAndSanitizeMetadata({ detail: 'Asiste a terapia semanal' })).toThrow(/Anti-PII Violation/);
  });

  it('rejects free-text values longer than 100 characters', () => {
    const longText = 'A'.repeat(101);
    expect(() => validateAndSanitizeMetadata({ comment: longText })).toThrow(/Anti-PII Violation/);
  });

  it('allows safe minimal commercial payloads', () => {
    const clean = validateAndSanitizeMetadata({
      billingCycle: 'monthly',
      childAgeRange: '8-10',
      durationSeconds: 45,
      disappearImpact: 'critical',
    });

    expect(clean).toEqual({
      billingCycle: 'monthly',
      childAgeRange: '8-10',
      durationSeconds: 45,
      disappearImpact: 'critical',
    });
  });
});

describe('ProductAnalyticsTracker Operations & Queueing', () => {
  beforeEach(() => {
    analytics.clearQueue();
  });

  it('tracks valid events and adds them to local queue', () => {
    const record = analytics.track('pricing_viewed', { page: 'landing' });
    expect(record).not.toBeNull();
    expect(record?.eventName).toBe('pricing_viewed');
    expect(record?.metadata).toEqual({ page: 'landing' });

    const queue = analytics.getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].eventName).toBe('pricing_viewed');
  });

  it('blocks tracking when metadata violates Anti-PII rules', () => {
    // @ts-expect-error Testing invalid PII input
    const record = analytics.track('early_family_signup', { email: 'invalid@p.com' });
    expect(record).toBeNull();

    const queue = analytics.getQueue();
    expect(queue.length).toBe(0);
  });

  it('caps queue size at 100 events', () => {
    for (let i = 0; i < 110; i++) {
      analytics.track('pricing_viewed', { page: `page_${i}` });
    }

    const queue = analytics.getQueue();
    expect(queue.length).toBe(100);
  });
});
