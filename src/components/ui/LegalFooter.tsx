import React from 'react';
import Link from 'next/link';

export function LegalFooter() {
  return (
    <footer className="w-full border-t border-stone-200 bg-stone-50/80 py-8 px-4 text-stone-600 text-xs mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <p className="font-semibold text-stone-800 text-sm">MIRATEA by Solutech</p>
          <p className="mt-1 text-stone-500 max-w-md">
            Plataforma de desarrollo personal, autorregulación y autonomía sin ansiedad.
            MIRATEA no sustituye la atención médica o terapéutica profesional.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-stone-600 font-medium">
          <Link href="/privacy" className="hover:text-teal-700 transition-colors">
            Política de Privacidad
          </Link>
          <span className="text-stone-300">•</span>
          <Link href="/terms" className="hover:text-teal-700 transition-colors">
            Términos de Servicio
          </Link>
          <span className="text-stone-300">•</span>
          <Link href="/cookies" className="hover:text-teal-700 transition-colors">
            Cookies y Almacenamiento
          </Link>
          <span className="text-stone-300">•</span>
          <a href="mailto:xavi@solutech.blog" className="hover:text-teal-700 transition-colors">
            Contacto
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6 pt-4 border-t border-stone-200/60 text-center text-stone-400">
        © {new Date().getFullYear()} Solutech — Todos los derechos reservados. Versión 1.1.0 (Commercial Product Release).
      </div>
    </footer>
  );
}
