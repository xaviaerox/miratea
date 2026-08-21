import React from 'react';
import Link from 'next/link';
import { MiraLogo } from '@/components/ui/MiraLogo';
import { LegalFooter } from '@/components/ui/LegalFooter';

export const metadata = {
  title: 'Términos de Servicio — MIRATEA by Solutech',
  description: 'Términos de Servicio y Exclusión de Responsabilidad Clínica de MIRATEA.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] text-stone-800 flex flex-col font-sans">
      <header className="w-full border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <MiraLogo size="md" showText={true} />
          </Link>
          <Link
            href="/landing"
            className="text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
          >
            ← Volver a Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
        <article className="prose prose-stone max-w-none space-y-6">
          <h1 className="text-3xl font-display font-bold text-stone-900">
            Términos de Servicio — MIRATEA by Solutech
          </h1>
          <p className="text-sm text-stone-500 font-mono">
            Última actualización: 21 de agosto de 2026 | Versión 1.1.0
          </p>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-xs text-teal-900">
            <strong>Exclusión de Responsabilidad Clínica:</strong> MIRATEA es una herramienta digital de acompañamiento, autorregulación y autonomía orientada al hogar. No constituye un producto sanitario, diagnóstico ni tratamiento médico o psicológico profesional.
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">1. Aceptación de los Términos</h2>
            <p className="text-sm leading-relaxed">
              Al acceder o utilizar MIRATEA, el perfil parental acepta estos Términos de Servicio en su nombre y en representación de los menores a su cargo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">2. Principios Inmutables del Producto</h2>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li><strong>Cero Rachas Punitivas:</strong> Prohibido cualquier contador de días consecutivos o penalización por inactividad.</li>
              <li><strong>Inmutabilidad del Compañero:</strong> La mascota Lumi jamás sufre regresión de nivel ni castigos.</li>
              <li><strong>Ausencia de Competición:</strong> Sin ránkings, tablas de clasificación ni comparación social.</li>
              <li><strong>Denominación Oficial de Moneda:</strong> La moneda de motivación se denomina exclusivamente <strong>Sparks ✦</strong>.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">3. Control Parental y Seguridad de PIN</h2>
            <p className="text-sm leading-relaxed">
              Las acciones sensibles (aprobación de recompensas, exportación de informes emocionales, cambios de PIN) están protegidas por el PIN parental. El perfil parental es responsable de mantener la confidencialidad de sus credenciales.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">4. Suscripciones, Programas y Cancelación</h2>
            <p className="text-sm leading-relaxed">
              El programa <em>MIRATEA Early Families</em> ofrece acceso prioritario con garantía de tarifa fundadora vitalicia. Las cuentas pueden ser canceladas o eliminadas en cualquier momento desde el panel de ajustes sin penalizaciones.
            </p>
          </section>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
