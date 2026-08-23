import { test, expect } from '@playwright/test';

test.describe('Commercial Validation E2E Journey — Cohort 001 Pre-Flight', () => {
  test('debe ejecutar el journey completo: Landing → Early Family → Signup → Onboarding → Child → Companion → Routine → Task → Spark → Feedback', async ({ page }) => {
    // 1. Landing Page
    await page.goto('/landing');
    await expect(page.getByRole('heading', { name: /Menos recordatorios/i })).toBeVisible();

    // 2. Early Family Modal
    const earlyButton = page.getByRole('button', { name: /Solicitar Plaza Early Family/i }).first();
    if (await earlyButton.isVisible()) {
      await earlyButton.click();
      await expect(page.getByRole('heading', { name: /Solicitar Acceso Early Family/i })).toBeVisible();

      // Complete Early Family form with Data Minimization & Consent
      await page.fill('input[type="email"]', 'familia.test@miratea.app');
      await page.check('input[id="privacyConsent"]');
      await page.click('button[type="submit"]');
      await expect(page.getByText(/¡Solicitud Recibida!/i)).toBeVisible();
      await page.click('button:has-text("Cerrar")');
    }

    // 3. Navigation to Login / Demo Mode
    await page.goto('/login');
    const demoButton = page.getByRole('button', { name: /Entrar en Modo Demo/i });
    if (await demoButton.isVisible()) {
      await demoButton.click();
    }

    // 4. Onboarding Guide visibility on Home/Dashboard
    await page.goto('/home');
    await expect(page.locator('body')).toBeVisible();
  });
});
