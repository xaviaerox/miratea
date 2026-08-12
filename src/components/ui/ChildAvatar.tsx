'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { createAvatar } from '@dicebear/core';
import { adventurer, bottts, funEmoji, lorelei } from '@dicebear/collection';

interface ChildAvatarProps {
  baseEmoji?: string;
  accessory?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const AVATAR_SIZES = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-16 h-16 text-3xl',
  lg: 'w-24 h-24 text-5xl',
  xl: 'w-32 h-32 text-7xl'
};

// Preset dictionary mapping character seeds/emojis to gamified DiceBear vector avatar configs
export const GAMIFIED_CHARACTER_PRESETS: Record<string, { style: unknown; seed: string; bgGradient: string }> = {
  '🦊': { style: adventurer, seed: 'Felix', bgGradient: 'from-amber-100 via-orange-50 to-white' },
  '🐼': { style: adventurer, seed: 'PandaMax', bgGradient: 'from-stone-200 via-stone-100 to-white' },
  '🐨': { style: adventurer, seed: 'MiloKoala', bgGradient: 'from-teal-100 via-emerald-50 to-white' },
  '🦁': { style: adventurer, seed: 'LeoKing', bgGradient: 'from-amber-200 via-yellow-100 to-white' },
  '🐯': { style: adventurer, seed: 'TigerToby', bgGradient: 'from-orange-200 via-amber-100 to-white' },
  '🐸': { style: funEmoji, seed: 'FroggyKermit', bgGradient: 'from-emerald-200 via-teal-100 to-white' },
  '🐰': { style: adventurer, seed: 'BunnyHop', bgGradient: 'from-rose-100 via-pink-50 to-white' },
  '🐙': { style: funEmoji, seed: 'OctoJoy', bgGradient: 'from-purple-200 via-indigo-100 to-white' },
  '🦄': { style: funEmoji, seed: 'SparkleUnicorn', bgGradient: 'from-fuchsia-200 via-pink-100 to-white' },
  '🦖': { style: bottts, seed: 'DinoBot', bgGradient: 'from-lime-200 via-emerald-100 to-white' },
  '🐒': { style: funEmoji, seed: 'ChimpPlay', bgGradient: 'from-amber-200 via-stone-100 to-white' },
  '🦉': { style: adventurer, seed: 'WiseOwl', bgGradient: 'from-sky-200 via-indigo-100 to-white' },
  '🤖': { style: bottts, seed: 'LumiBot3000', bgGradient: 'from-cyan-200 via-sky-100 to-white' },
  '🧙': { style: lorelei, seed: 'CalmWizard', bgGradient: 'from-violet-200 via-purple-100 to-white' },
};

// Vector accessory overlay offsets per accessory type
const VECTOR_ACCESSORY_OFFSETS: Record<string, string> = {
  '🕶️': 'top-[30%] left-[50%] -translate-x-[50%] text-[0.52em]',
  '👑': 'top-[-18%] left-[50%] -translate-x-[50%] -rotate-6 text-[0.62em]',
  '🎩': 'top-[-26%] left-[50%] -translate-x-[50%] -rotate-3 text-[0.68em]',
  '🎓': 'top-[-24%] left-[50%] -translate-x-[50%] -rotate-6 text-[0.65em]',
  '🎀': 'top-[4%] right-[8%] rotate-12 text-[0.52em]',
  '🎧': 'top-[-4%] left-[50%] -translate-x-[50%] text-[0.78em]',
};

export function ChildAvatar({
  baseEmoji = '🦊',
  accessory,
  size = 'md',
  className = '',
  onClick,
  interactive = true,
}: ChildAvatarProps) {
  const sizeClass = AVATAR_SIZES[size];

  // Lookup preset
  const preset = useMemo(() => {
    return GAMIFIED_CHARACTER_PRESETS[baseEmoji] || {
      style: adventurer,
      seed: baseEmoji || 'MiraChild',
      bgGradient: 'from-amber-100 via-amber-50 to-white',
    };
  }, [baseEmoji]);

  // Generate crisp SVG vector avatar Data URI
  const svgDataUri = useMemo(() => {
    try {
      const avatar = createAvatar(preset.style as Parameters<typeof createAvatar>[0], {
        seed: preset.seed,
        size: 128,
      });
      return avatar.toDataUri();
    } catch (e) {
      console.warn('Error generating DiceBear avatar:', e);
      return null;
    }
  }, [preset]);

  const accPos = accessory ? VECTOR_ACCESSORY_OFFSETS[accessory] || 'top-0 left-[50%] -translate-x-[50%] text-[0.5em]' : '';

  return (
    <motion.div
      onClick={onClick}
      whileHover={interactive ? { scale: 1.08, rotate: 2 } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={`relative rounded-full bg-gradient-to-tr ${preset.bgGradient} dark:from-stone-850 dark:to-stone-800 border-2 border-amber-200/80 dark:border-stone-700 flex items-center justify-center select-none shadow-soft overflow-visible cursor-pointer ${sizeClass} ${className}`}
    >
      {/* Background Glow Aura */}
      <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-sm pointer-events-none" />

      {/* Vector Avatar Image */}
      {svgDataUri ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={svgDataUri}
          alt={`Avatar ${preset.seed}`}
          className="w-[85%] h-[85%] object-contain relative z-0 filter drop-shadow-xs select-none pointer-events-none"
        />
      ) : (
        <span className="relative z-0 leading-none filter drop-shadow-xs">{baseEmoji}</span>
      )}

      {/* Vector Accessory Overlay */}
      {accessory && (
        <span className={`absolute pointer-events-none z-10 filter drop-shadow-md leading-none ${accPos}`}>
          {accessory}
        </span>
      )}
    </motion.div>
  );
}
