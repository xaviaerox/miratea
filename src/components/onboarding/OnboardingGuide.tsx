'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface OnboardingGuideProps {
  hasChildProfile: boolean;
  hasCompanion: boolean;
  hasRoutine: boolean;
  hasCompletedTask: boolean;
  hasEarnedSpark: boolean;
  onNavigate: (step: string) => void;
}

export function OnboardingGuide({
  hasChildProfile,
  hasCompanion,
  hasRoutine,
  hasCompletedTask,
  hasEarnedSpark,
  onNavigate,
}: OnboardingGuideProps) {
  const [dismissed, setDismissed] = useState(false);
  const { trackEvent } = useAnalytics();

  const steps = [
    { id: 'child', label: 'Crear perfil infantil', done: hasChildProfile },
    { id: 'companion', label: 'Elegir y nombrar al compañero Lumi', done: hasCompanion },
    { id: 'routine', label: 'Crear primera rutina diaria', done: hasRoutine },
    { id: 'task', label: 'Completar primera tarea', done: hasCompletedTask },
    { id: 'spark', label: 'Obtener primer Spark ✦', done: hasEarnedSpark },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const isFullyActivated = completedCount === steps.length;

  if (dismissed || isFullyActivated) return null;

  return (
    <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-stone-900 text-white rounded-3xl p-6 shadow-xl border border-teal-700/60 relative mb-8 animate-in fade-in">
      <button
        onClick={() => {
          setDismissed(true);
          trackEvent('privacy_viewed', { action: 'dismiss_onboarding_guide' });
        }}
        className="absolute top-4 right-4 text-teal-300 hover:text-white text-xs font-semibold"
      >
        Ocultar
      </button>

      <div className="flex items-center gap-2 mb-2 text-amber-300 font-display font-bold text-base">
        <Sparkles className="w-5 h-5" />
        <span>Activación Familiar MIRATEA</span>
      </div>

      <p className="text-xs text-teal-100 max-w-xl leading-relaxed mb-4">
        Completa estos 5 micropasos iniciales para experimentar el primer avance en autonomía con tu hijo en menos de 10 minutos.
      </p>

      {/* PROGRESS BAR */}
      <div className="w-full bg-teal-950/60 h-2 rounded-full mb-5 overflow-hidden border border-teal-700/40">
        <div
          className="bg-amber-400 h-full transition-all duration-500 ease-out"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            onClick={() => onNavigate(step.id)}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
              step.done
                ? 'bg-teal-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-teal-950/80 border-teal-700/70 text-teal-100 hover:bg-teal-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {step.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-teal-400 shrink-0" />
              )}
              <span>
                {idx + 1}. {step.label}
              </span>
            </div>
            {!step.done && <ArrowRight className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
