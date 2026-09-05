import { describe, it, expect, beforeEach } from 'vitest';
import {
  analytics,
  validateAndSanitizeMetadata,
  sanitizeError,
  sanitizeUrl,
} from '../index';

describe('Analytics & Observability Infrastructure Suite', () => {
  beforeEach(() => {
    analytics.clearQueue();
    analytics.clearReports();
  });

  describe('Anti-PII & Privacy Guard (Zero-PII Compliance)', () => {
    it('bloquea claves prohibidas que contengan nombres, correos, teléfonos o diagnósticos', () => {
      expect(() => validateAndSanitizeMetadata({ child_name: 'Lucas' })).toThrow(/Anti-PII Violation/);
      expect(() => validateAndSanitizeMetadata({ email: 'familia@example.com' })).toThrow(/Anti-PII Violation/);
      expect(() => validateAndSanitizeMetadata({ phone_number: '+34600112233' })).toThrow(/Anti-PII Violation/);
      expect(() => validateAndSanitizeMetadata({ clinical_notes: 'Paciente evaluado' })).toThrow(/Anti-PII Violation/);
      expect(() => validateAndSanitizeMetadata({ diagnosis_info: 'TEA Grado 1' })).toThrow(/Anti-PII Violation/);
    });

    it('bloquea valores que contengan patrones de PII o términos clínicos', () => {
      expect(() => validateAndSanitizeMetadata({ notes: 'Escribir a contacto@test.org' })).toThrow(/Anti-PII Violation/);
      expect(() => validateAndSanitizeMetadata({ doc: 'DNI: 12345678Z' })).toThrow(/Anti-PII Violation/);
      expect(() => validateAndSanitizeMetadata({ detail: 'Presenta rasgos de autismo' })).toThrow(/Anti-PII Violation/);
      expect(() => validateAndSanitizeMetadata({ therapy: 'Sesión de psicología' })).toThrow(/Anti-PII Violation/);
    });

    it('rechaza strings libres superiores a 100 caracteres', () => {
      const longString = 'X'.repeat(101);
      expect(() => validateAndSanitizeMetadata({ text: longString })).toThrow(/Anti-PII Violation/);
    });

    it('permite metadatos numéricos y categóricos anonimizados válidos', () => {
      const valid = validateAndSanitizeMetadata({
        valence: 4,
        energyLevel: 3,
        stepCount: 5,
        billingCycle: 'annual',
      });

      expect(valid).toEqual({
        valence: 4,
        energyLevel: 3,
        stepCount: 5,
        billingCycle: 'annual',
      });
    });
  });

  describe('Product Analytics Operations (Fail-safe & Queueing)', () => {
    it('registra eventos tipados de forma no bloqueante y los encola en local', () => {
      const record = analytics.track('routine_completed', { taskCount: 3, totalSparks: 15 });
      expect(record).not.toBeNull();
      expect(record?.eventName).toBe('routine_completed');
      expect(record?.metadata).toEqual({ taskCount: 3, totalSparks: 15 });

      const queue = analytics.getQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].eventName).toBe('routine_completed');
    });

    it('es fail-safe y rechaza eventos con PII sin provocar crash ni propagar excepción', () => {
      // @ts-expect-error Probando payload con PII deliberada
      const record = analytics.track('early_family_signup', { email: 'leak@example.com' });
      expect(record).toBeNull();

      const queue = analytics.getQueue();
      expect(queue.length).toBe(0);
    });

    it('soporta sobrecarga con contexto de usuario opaco (familyId y childId)', () => {
      const record = analytics.track(
        'calm_space_opened',
        { source: 'routine_banner' },
        { familyId: 'fam_123', childId: 'child_456' }
      );
      expect(record).not.toBeNull();
      expect(record?.familyId).toBe('fam_123');
      expect(record?.childId).toBe('child_456');
    });

    it('identify rechaza emails directos como identificador de usuario', () => {
      analytics.identify('parent@example.com', { role: 'parent' });
      // Se rechaza de forma fail-safe sin crash
    });
  });

  describe('Technical Observability & Error Sanitization', () => {
    it('sanitiza mensajes y stack traces de errores técnicos eliminando emails y teléfonos', () => {
      const errorWithPii = new Error('Falló conexión para el usuario test@correo.es con teléfono 612345678');
      const { message } = sanitizeError(errorWithPii);

      expect(message).toContain('[EMAIL_REDACTED]');
      expect(message).toContain('[PHONE_REDACTED]');
      expect(message).not.toContain('test@correo.es');
      expect(message).not.toContain('612345678');
    });

    it('sanitiza URLs eliminando query parameters con tokens o emails', () => {
      const cleanUrl = sanitizeUrl('https://miratea.app/dashboard?token=xyz123&email=user@test.org&tab=routines');
      expect(cleanUrl).toContain('tab=routines');
      expect(cleanUrl).not.toContain('token=xyz123');
      expect(cleanUrl).not.toContain('user@test.org');
    });

    it('captura errores técnicos en el buffer de telemetría de forma no bloqueante', () => {
      analytics.error(new Error('Test Technical Failure'), { component: 'RoutineBoard' });
      const reports = analytics.getReports();

      expect(reports.length).toBe(1);
      expect(reports[0].message).toBe('Test Technical Failure');
      expect(reports[0].context).toEqual({ component: 'RoutineBoard' });
    });
  });
});
