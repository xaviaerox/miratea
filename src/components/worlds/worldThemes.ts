import type { ValueDimensionId } from '@/types';

export interface WorldTheme {
  id: string;
  name: string;
  dimension: ValueDimensionId;
  bgGradient: string;
  auraGradient: string;
  textColor: string;
  accentBg: string;
  accentBorder: string;
  emoji: string;
  description: string;
  ambientCues: {
    icon: string;
    label: string;
  };
}

export const WORLD_THEMES: WorldTheme[] = [
  {
    id: 'lago_calma',
    name: 'Lago de la Calma',
    dimension: 'regulation',
    bgGradient: 'from-sky-100 via-sky-50 to-blue-100',
    auraGradient: 'from-sky-100/60 via-blue-50/30 to-transparent',
    textColor: 'text-sky-850',
    accentBg: 'bg-sky-50/90 border-sky-200/90 hover:bg-sky-100/70',
    accentBorder: 'border-sky-200',
    emoji: '☯',
    description: 'Aprende a regular tus emociones y respirar hondo.',
    ambientCues: {
      icon: '💧',
      label: 'Bruma y calma acuática',
    },
  },
  {
    id: 'valle_habitos',
    name: 'Valle de los Hábitos',
    dimension: 'connection', // Constancia
    bgGradient: 'from-emerald-100 via-green-50 to-teal-100',
    auraGradient: 'from-emerald-100/50 via-green-50/30 to-transparent',
    textColor: 'text-moss-850',
    accentBg: 'bg-moss-50/90 border-moss-200/90 hover:bg-moss-100/70',
    accentBorder: 'border-moss-200',
    emoji: '♾',
    description: 'La constancia en tus rutinas hace que este valle florezca.',
    ambientCues: {
      icon: '🌸',
      label: 'Pétalos y brisa suave',
    },
  },
  {
    id: 'bosque_autonomia',
    name: 'Bosque de la Autonomía',
    dimension: 'autonomy',
    bgGradient: 'from-green-100 via-emerald-50 to-emerald-200',
    auraGradient: 'from-teal-100/50 via-emerald-50/30 to-transparent',
    textColor: 'text-emerald-850',
    accentBg: 'bg-emerald-50/90 border-emerald-200/90 hover:bg-emerald-100/70',
    accentBorder: 'border-emerald-200',
    emoji: '↟',
    description: 'Haz las cosas por ti mismo y ayuda a crecer a los árboles.',
    ambientCues: {
      icon: '🍃',
      label: 'Hojas y luciérnagas',
    },
  },
  {
    id: 'montana_esfuerzo',
    name: 'Montañas del Esfuerzo',
    dimension: 'courage', // Valentía
    bgGradient: 'from-amber-100 via-orange-50 to-rose-100',
    auraGradient: 'from-amber-100/50 via-orange-50/30 to-transparent',
    textColor: 'text-bloom-850',
    accentBg: 'bg-bloom-50/90 border-bloom-200/90 hover:bg-bloom-100/70',
    accentBorder: 'border-bloom-200',
    emoji: '▲',
    description: 'Supera tus miedos y sube las cumbres del esfuerzo.',
    ambientCues: {
      icon: '✦',
      label: 'Chispas de esfuerzo',
    },
  },
  {
    id: 'reino_social',
    name: 'Reino de la Vida Social',
    dimension: 'empathy',
    bgGradient: 'from-purple-100 via-pink-50 to-fuchsia-100',
    auraGradient: 'from-purple-100/50 via-pink-50/30 to-transparent',
    textColor: 'text-lavender-850',
    accentBg: 'bg-lavender-50/90 border-lavender-200/90 hover:bg-lavender-100/70',
    accentBorder: 'border-lavender-200',
    emoji: '♡',
    description: 'Comparte con otros, empatiza y haz amigos.',
    ambientCues: {
      icon: '♡',
      label: 'Destellos de empatía',
    },
  },
];

export function getWorldPhase(score: number): { phase: 'seed' | 'sprout' | 'bloom'; label: string; icon: string } {
  if (score >= 100) return { phase: 'bloom', label: 'Esplendor', icon: '✿' };
  if (score >= 31) return { phase: 'sprout', label: 'Brote', icon: '✣' };
  return { phase: 'seed', label: 'Semilla', icon: '○' };
}

export function getWorldProgress(score: number): { percent: number; nextLabel: string } {
  if (score >= 100) {
    return { percent: 100, nextLabel: 'Esplendor máximo' };
  }
  if (score >= 31) {
    const percent = Math.round(((score - 31) / 69) * 100);
    return { percent, nextLabel: 'para Esplendor' };
  }
  const percent = Math.round((score / 30) * 100);
  return { percent, nextLabel: 'para Brote' };
}
