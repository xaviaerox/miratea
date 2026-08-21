import React from 'react';
import Link from 'next/link';
import { MiraLogo } from '@/components/ui/MiraLogo';
import { LegalFooter } from '@/components/ui/LegalFooter';

export const metadata = {
  title: 'Política de Cookies y Almacenamiento — MIRATEA by Solutech',
  description: 'Información transparente sobre el uso de cookies y almacenamiento local PWA en MIRATEA.',
};

export default function CookiesPage() {
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
            Política de Cookies y Almacenamiento Local
          </h1>
          <p className="text-sm text-stone-500 font-mono">
            Última actualización: 21 de agosto de 2026 | Versión 1.1.0
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">1. Ausencia de Cookies Rastreadoras o Publicitarias</h2>
            <p className="text-sm leading-relaxed">
              MIRATEA <strong>no utiliza cookies de terceros para perfilado publicitario, venta de datos ni rastro comercial</strong>. No incluimos píxeles publicitarios ni rastreadores invasivos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">2. Almacenamiento Estrictamente Necesario</h2>
            <p className="text-sm leading-relaxed">
              Para ofrecer una experiencia PWA offline fluida y segura, MIRATEA utiliza las siguientes tecnologías en el navegador del usuario:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li><strong>SessionStorage & LocalStorage:</strong> Mantenimiento de la sesión activa, estado de autenticación y tokens de seguridad RLS.</li>
              <li><strong>IndexedDB & WebStorage Queue:</strong> Cola de sincronización offline para guardar marcas de rutinas o registros cuando no hay conexión.</li>
              <li><strong>Cache API (Service Worker):</strong> Almacenamiento de assets estáticos e isotipo oficial para la instalación PWA.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">3. Control del Usuario</h2>
            <p className="text-sm leading-relaxed">
              El usuario puede borrar la memoria caché o los datos locales almacenados en cualquier momento a través de la configuración de su navegador, sin perjuicio de tener que iniciar sesión nuevamente.
            </p>
          </section>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
