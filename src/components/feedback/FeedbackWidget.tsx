'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getSupabaseClient } from '@/lib/supabase';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface FeedbackWidgetProps {
  role?: 'parent' | 'child';
  familyId?: string;
}

export function FeedbackWidget({ role = 'parent', familyId }: FeedbackWidgetProps) {
  const { trackEvent } = useAnalytics();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Child sentiment feedback
  const handleChildSentiment = async (emoji: string) => {
    setIsSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('feedback_responses').insert({
          family_id: familyId || null,
          feedback_type: 'child_sentiment',
          disappear_impact: emoji,
        });
      }
      trackEvent('child_sentiment_submitted', { sentimentEmoji: emoji, source: 'feedback_widget' }, familyId);
      setSubmitted(true);
    } catch (err) {
      console.error('[ChildSentiment] Error:', err);
      trackEvent('child_sentiment_submitted', { sentimentEmoji: emoji, source: 'feedback_widget' }, familyId);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parent D30 value evaluation
  const handleParentFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const disappearImpact = String(formData.get('disappearImpact') || 'moderate');
    const rawNotes = String(formData.get('feedbackNotes') || '').slice(0, 300);

    // Sanitize notes: remove potential email/phone PII before saving
    const cleanNotes = rawNotes
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE]');

    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('feedback_responses').insert({
          family_id: familyId || null,
          feedback_type: 'parent_d30',
          disappear_impact: disappearImpact,
          notes: cleanNotes || null,
        });
      }
      trackEvent(
        'parent_value_evaluated',
        { disappearImpact },
        familyId
      );
      setSubmitted(true);
    } catch (err) {
      console.error('[ParentFeedback] Error:', err);
      trackEvent(
        'parent_value_evaluated',
        { disappearImpact },
        familyId
      );
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
            onClick={() => handleChildSentiment('😞')}
            className="hover:scale-125 transition-transform p-1 disabled:opacity-50"
            title="Regular"
          >
            😞
          </button>
          <button
            disabled={isSubmitting}
            onClick={() => handleChildSentiment('😐')}
            className="hover:scale-125 transition-transform p-1 disabled:opacity-50"
            title="Normal"
          >
            😐
          </button>
          <button
            disabled={isSubmitting}
            onClick={() => handleChildSentiment('🙂')}
            className="hover:scale-125 transition-transform p-1 disabled:opacity-50"
            title="Bien"
          >
            🙂
          </button>
          <button
            disabled={isSubmitting}
            onClick={() => handleChildSentiment('🤩')}
            className="hover:scale-125 transition-transform p-1 disabled:opacity-50"
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
        <label className="text-xs font-semibold text-stone-700">Comentarios o sugerencias (Sin datos personales)</label>
        <textarea
          name="feedbackNotes"
          rows={2}
          placeholder="¿Qué parte os resulta más útil o qué echáis en falta?"
          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Valoración'}
      </button>
    </form>
  );
}

