'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface FeedbackWidgetProps {
  role?: 'parent' | 'child';
}

export function FeedbackWidget({ role = 'parent' }: FeedbackWidgetProps) {
  const { trackEvent } = useAnalytics();
  const [submitted, setSubmitted] = useState(false);

  // Child sentiment feedback
  const handleChildSentiment = (emoji: string) => {
    trackEvent('emotion_logged', { childSentiment: emoji, source: 'feedback_widget' });
    setSubmitted(true);
  };

  // Parent D30 value evaluation
  const handleParentFeedback = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const valueRating = formData.get('valueRating');
    const disappearImpact = formData.get('disappearImpact');
    const feedbackNotes = formData.get('feedbackNotes');

    trackEvent('privacy_viewed', {
      type: 'parent_d30_feedback',
      valueRating,
      disappearImpact,
      feedbackNotes,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-xs flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <span>¡Muchas gracias por tu valoración! Nos ayuda a mejorar MIRATEA cada día.</span>
      </div>
    );
  }

  if (role === 'child') {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm text-center space-y-3">
        <p className="text-xs font-semibold text-stone-700">¿Qué tal te sientes hoy con tu rutina?</p>
        <div className="flex justify-center items-center gap-4 text-2xl">
          <button
            onClick={() => handleChildSentiment('😞')}
            className="hover:scale-125 transition-transform p-1"
            title="Regular"
          >
            😞
          </button>
          <button
            onClick={() => handleChildSentiment('😐')}
            className="hover:scale-125 transition-transform p-1"
            title="Normal"
          >
            😐
          </button>
          <button
            onClick={() => handleChildSentiment('🙂')}
            className="hover:scale-125 transition-transform p-1"
            title="Bien"
          >
            🙂
          </button>
          <button
            onClick={() => handleChildSentiment('🤩')}
            className="hover:scale-125 transition-transform p-1"
            title="¡Genial!"
          >
            🤩
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleParentFeedback}
      className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center gap-2 text-stone-900 font-display font-bold text-sm">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>Evaluación de Valor Familiar (Programa Early Family)</span>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-700">
          Si MIRATEA desapareciera mañana, ¿qué impacto tendría en vuestras rutinas?
        </label>
        <select
          name="disappearImpact"
          required
          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
        >
          <option value="none">Ninguno (podríamos gestionarlo igual)</option>
          <option value="moderate">La echaríamos de menos (era útil)</option>
          <option value="high">Tendríamos que volver a discusiones y recordatorios continuos</option>
          <option value="critical">Muy alto: no queremos volver a gestionar el día a día como antes</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-700">Comentarios o sugerencias</label>
        <textarea
          name="feedbackNotes"
          rows={2}
          placeholder="¿Qué parte os resulta más útil o qué echáis en falta?"
          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors"
      >
        Enviar Valoración
      </button>
    </form>
  );
}
