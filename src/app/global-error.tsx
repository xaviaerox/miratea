'use client';

import { useEffect } from 'react';
import { analytics } from '@/infrastructure/analytics';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    analytics.error(error, {
      digest: error.digest,
      boundary: 'root_global_error_boundary',
    });
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen bg-[#FAF9F7] text-stone-800 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-stone-900">
              Pausa de conexión
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Ha ocurrido una incidencia en la aplicación. Puedes reiniciar de forma segura.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Reiniciar aplicación
          </button>
        </div>
      </body>
    </html>
  );
}
