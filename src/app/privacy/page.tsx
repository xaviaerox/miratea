import React from 'react';
import Link from 'next/link';
import { MiraLogo } from '@/components/ui/MiraLogo';
import { LegalFooter } from '@/components/ui/LegalFooter';

export const metadata = {
  title: 'Política de Privacidad — MIRATEA by Solutech',
  description: 'Política de Privacidad y Protección de Datos de Menores de MIRATEA.',
};

export default function PrivacyPage() {
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
            Política de Privacidad — MIRATEA by Solutech
          </h1>
          <p className="text-sm text-stone-500 font-mono">
            Última actualización: 21 de agosto de 2026 | Versión 1.1.0
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
            <strong>Protección Reforzada de Menores (RGPD Art. 8 & COPPA):</strong> MIRATEA aplica un enfoque de privacidad por diseño. Los perfiles infantiles son gestionados exclusivamente por el perfil parental registrado y ningún dato de menor es enviado a servicios de IA externos sin anonimización previa mediante nuestro filtro <code>PiiSanitizer</code>.
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">1. Responsable del Tratamiento</h2>
            <p className="text-sm leading-relaxed">
              El responsable del tratamiento de los datos es Solutech (contacto: <code>xavi@solutech.blog</code>). MIRATEA ofrece una plataforma digital modular de desarrollo personal, autorregulación y autonomía orientada al entorno del Espectro Autista (TEA), TDAH, altas capacidades y sus familias.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">2. Datos Objeto de Tratamiento</h2>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li><strong>Perfil Parental:</strong> Dirección de correo electrónico, nombre de usuario, contraseña cifrada, PIN parental hashed (SHA-256).</li>
              <li><strong>Perfil Infantil:</strong> Nombre o alias (sanitizable), edad aproximada, avatar y personalizaciones de Lumi.</li>
              <li><strong>Datos de Actividad y Autorregulación:</strong> Rutinas completadas, registros emocionales (ánimo, energía), micropasos de metas y ejercicios del Rincón de Calma.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">3. Anonimización Pre-IA (PiiSanitizer)</h2>
            <p className="text-sm leading-relaxed">
              Las funciones inteligentes de desintegración de objetivos emplean proveedores de lenguaje (LLM). Antes de transmitir cualquier prompt, <code>PiiSanitizer</code> sustituye los identificadores directos (nombres del menor, correos, nombres de familia) por marcadores anonimizados opacos (ej. <code>[CHILD_NAME]</code>). Los nombres reales jamás salen del dispositivo local.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">4. Aislamiento Multitenant con RLS</h2>
            <p className="text-sm leading-relaxed">
              En nuestra infraestructura de base de datos (Supabase PostgreSQL), cada cuenta familiar está aislada de forma estricta mediante políticas Row Level Security (RLS) impuestas a nivel de base de datos por el identificador único de familia (<code>family_id</code>).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">5. Derechos del Usuario y Portabilidad (RGPD Art. 20)</h2>
            <p className="text-sm leading-relaxed">
              El perfil parental puede ejercer en todo momento sus derechos de acceso, rectificación, supresión, limitación y eliminación completa de cuenta. Asimismo, dispone de la exportación nativa de todos sus datos e informes clínicos en formatos estructurados PDF, CSV y JSON desde su panel.
            </p>
          </section>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
