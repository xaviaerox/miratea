'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { analytics } from '@/infrastructure/analytics';
import { MiraLogo } from '@/components/ui/MiraLogo';
import { RefreshCw, Home } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Observabilidad técnica automatizada sin PII
    analytics.error(error, {
      digest: error.digest,
      boundary: 'route_error_boundary',
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col items-center justify-center p-6 text-stone-800">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center space-y-6">
        <div className="flex justify-center">
          <MiraLogo size="lg" showText={false} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold text-stone-900">
            Un pequeño descanso
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            Algo se ha detenido un momento, pero no te preocupes: todos tus datos y progresos están a salvo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/landing"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-sm transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Ir a Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
