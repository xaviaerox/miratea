import { describe, it, expect } from 'vitest';
import { GUIDE_CATEGORIES } from '@/components/help/GuideNav';
import { GUIDE_FAQS } from '@/components/help/GuideFaq';

describe('Guía de Ayuda de MIRATEA (Lógica y Reglas Inmutables)', () => {
  it('debe contener todas las categorías clave de la plataforma', () => {
    const categoryIds = GUIDE_CATEGORIES.map(c => c.id);
    expect(categoryIds).toContain('todos');
    expect(categoryIds).toContain('filosofia');
    expect(categoryIds).toContain('registro');
    expect(categoryIds).toContain('familias');
    expect(categoryIds).toContain('lumi');
    expect(categoryIds).toContain('rutinas');
    expect(categoryIds).toContain('metas');
    expect(categoryIds).toContain('sparks');
    expect(categoryIds).toContain('calma');
    expect(categoryIds).toContain('seguridad');
    expect(categoryIds).toContain('accesibilidad');
    expect(categoryIds).toContain('faq');
  });

  it('debe cumplir la Regla 2 inmutable: denominación Sparks (nunca "chispas")', () => {
    GUIDE_FAQS.forEach(faq => {
      const fullText = (faq.question + ' ' + faq.answer).toLowerCase();
      expect(fullText).not.toContain('chispas');
      expect(fullText).not.toContain('chispa');
    });

    GUIDE_CATEGORIES.forEach(cat => {
      const fullText = cat.label.toLowerCase();
      expect(fullText).not.toContain('chispas');
    });
  });

  it('debe contener respuestas afirmativas sobre el enfoque neurodivergente sin punición', () => {
    const streakFaq = GUIDE_FAQS.find(f => f.category === 'rutinas');
    expect(streakFaq).toBeDefined();
    expect(streakFaq?.answer.toLowerCase()).toContain('lumi nunca pierde nivel');
    expect(streakFaq?.answer.toLowerCase()).toContain('sin mecánicas de castigo');
  });

  it('debe explicar el flujo de invitaciones de 8 caracteres para vincular a menores', () => {
    const familyFaq = GUIDE_FAQS.find(f => f.id === 'faq-3');
    expect(familyFaq).toBeDefined();
    expect(familyFaq?.answer).toContain('8 caracteres');
    expect(familyFaq?.answer).toContain('/join');
  });

  it('debe reflejar la protección Zero-PII y sanitización con PiiSanitizer', () => {
    const securityFaq = GUIDE_FAQS.find(f => f.category === 'seguridad');
    expect(securityFaq).toBeDefined();
    expect(securityFaq?.answer).toContain('PiiSanitizer');
    expect(securityFaq?.answer).toContain('Zero-PII');
  });

  it('debe orientar al usuario hacia la Pestaña de Ajustes para OpenDyslexic y Menos Efectos (Regla 5)', () => {
    const accessFaq = GUIDE_FAQS.find(f => f.category === 'accesibilidad');
    expect(accessFaq).toBeDefined();
    expect(accessFaq?.answer).toContain('Pestaña de Ajustes');
    expect(accessFaq?.answer).toContain('OpenDyslexic');
  });
});
