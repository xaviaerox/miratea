import type { EffortLevel } from '@/types';
import { supabase } from '@/lib/supabase';
import { isUseSupabase } from '@/lib/adapters';
import { getApiUrl } from '../utils';

export interface AIMicrotaskSuggestion {
  title: string;
  effort: EffortLevel;
  description?: string;
}

export interface AIDecomposeResult {
  microtasks: AIMicrotaskSuggestion[];
  source: 'ai' | 'fallback';
}

export async function decomposeGoalWithAI(goalTitle: string, targetCount: number = 3): Promise<AIDecomposeResult> {
  const cleanTitle = goalTitle.trim();
  const countToUse = Math.max(1, Math.min(10, targetCount));

  if (!cleanTitle) {
    return { microtasks: getFallbackMicrotasks(cleanTitle, countToUse), source: 'fallback' };
  }

  const prompt = `Descompón la meta "${cleanTitle}" para un niño neurodivergente en exactamente ${countToUse} microtareas progresivas y motivadoras que se puedan completar en 5 a 10 minutos.

Responde ÚNICAMENTE con un JSON válido con este formato:
{
  "microtasks": [
    {
      "title": "Nombre corto del paso 1",
      "effort": "easy",
      "description": "Una frase de ánimo corta"
    }
  ]
}`;

  try {
    let rawText = '';

    const res = await fetch(getApiUrl('/api/decompose'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      rawText = data.text || '';
    } else if (isUseSupabase()) {
      const { data: edgeData, error } = await supabase.functions.invoke('decompose', {
        body: { prompt },
      });
      if (!error && edgeData?.text) {
        rawText = edgeData.text;
      }
    }

    if (rawText) {
      const parsed = JSON.parse(rawText);
      if (parsed.microtasks && Array.isArray(parsed.microtasks) && parsed.microtasks.length > 0) {
        const validated: AIMicrotaskSuggestion[] = parsed.microtasks.slice(0, countToUse).map((item: Record<string, unknown>, idx: number) => ({
          title: String(item.title || `Paso ${idx + 1}`),
          effort: item.effort === 'easy' || item.effort === 'medium' || item.effort === 'stretch' ? (item.effort as EffortLevel) : idx === 0 ? 'easy' : idx === countToUse - 1 ? 'stretch' : 'medium',
          description: item.description ? String(item.description) : undefined,
        }));

        return { microtasks: validated, source: 'ai' };
      }
    }
  } catch (err) {
    console.warn('[decomposeAI] Error fetching AI microtasks, fallback used:', err);
  }

  return { microtasks: getFallbackMicrotasks(cleanTitle, countToUse), source: 'fallback' };
}

function getFallbackMicrotasks(title: string, count: number): AIMicrotaskSuggestion[] {
  const baseSteps: AIMicrotaskSuggestion[] = [
    {
      title: `Explorar y preparar los materiales para ${title || 'la meta'}`,
      effort: 'easy',
      description: 'Dar el primer paso sencillo sin presiones.',
    },
    {
      title: `Practicar 5 minutos concentrado/a`,
      effort: 'medium',
      description: 'Avanzar un poquito más a tu ritmo.',
    },
    {
      title: `Seguir avanzando con constancia`,
      effort: 'medium',
      description: 'Disfrutar del proceso de aprendizaje.',
    },
    {
      title: `Superar el segundo reto de práctica`,
      effort: 'medium',
      description: 'Consolidar lo aprendido.',
    },
    {
      title: `Completar el reto principal`,
      effort: 'stretch',
      description: 'Demostrar tu gran esfuerzo y conseguir el logro.',
    },
  ];

  if (count <= baseSteps.length) {
    return baseSteps.slice(0, count);
  }

  const result = [...baseSteps];
  for (let i = baseSteps.length; i < count; i++) {
    result.push({
      title: `Paso ${i + 1} hacia el objetivo final`,
      effort: i === count - 1 ? 'stretch' : 'medium',
      description: 'Un paso más hacia la victoria.',
    });
  }
  return result;
}
