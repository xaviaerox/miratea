import { describe, it, expect, beforeEach } from 'vitest';
import { StaticAuthAdapter } from '../StaticAuthAdapter';

describe('StaticAuthAdapter (Phase 1)', () => {
  let adapter: StaticAuthAdapter;

  beforeEach(() => {
    adapter = new StaticAuthAdapter();
  });

  describe('signUpParent', () => {
    it('fails when legal consent is not given', async () => {
      const res = await adapter.signUpParent({
        email: 'test@mira.app',
        password: 'password123',
        display_name: 'Parent Demo',
        family_name: 'Mira Family',
        consent_given: false,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe('consent_required');
      }
    });

    it('creates a new parent profile and family when legal consent is given', async () => {
      const timestamp = new Date().toISOString();
      const res = await adapter.signUpParent({
        email: 'test@mira.app',
        password: 'password123',
        display_name: 'Parent Demo',
        family_name: 'Mira Family',
        consent_given: true,
        consent_timestamp: timestamp,
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.profile.role).toBe('parent');
        expect(res.data.profile.display_name).toBe('Parent Demo');
        expect(res.data.profile.consent_given).toBe(true);
        expect(res.data.profile.consent_timestamp).toBe(timestamp);
        expect(res.data.family.name).toBe('Mira Family');
      }
    });
  });

  describe('signIn', () => {
    it('authenticates demo parent user', async () => {
      const res = await adapter.signIn({ email: 'parent@mira.app', password: 'demo1234' });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.profile.role).toBe('parent');
      }
    });
  });

  describe('signOut', () => {
    it('clears active session', async () => {
      await adapter.signIn({ email: 'parent@mira.app', password: 'demo1234' });
      const res = await adapter.signOut();
      expect(res.ok).toBe(true);
      const sessionRes = await adapter.getSession();
      expect(sessionRes).toBeNull();
    });
  });
});
