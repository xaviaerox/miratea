'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { REWARD_ICON_CATEGORIES, ALL_REWARD_ICONS } from '@/lib/rewards/RewardIcons';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface RewardIconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

export function RewardIconPicker({ value, onChange, className }: RewardIconPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const selectedCategory = REWARD_ICON_CATEGORIES.find(c => c.id === activeCategory);
  const displayedIcons = selectedCategory ? selectedCategory.icons : ALL_REWARD_ICONS;

  return (
    <div className={cn('flex flex-col gap-3.5', className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider font-display flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Icono Representativo</span>
        </label>
        <span className="text-[11px] text-stone-400 font-body">Elige uno o escribe el tuyo</span>
      </div>

      {/* Live Preview Card & Custom Input Row */}
      <div className="flex items-center gap-3">
        {/* Large Tile Preview */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-tr from-amber-100 via-amber-50 to-white dark:from-amber-950/60 dark:to-stone-800 border-2 border-amber-300/80 dark:border-amber-700/60 flex items-center justify-center text-3xl shadow-soft relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-amber-400/10 blur-sm pointer-events-none" />
          <span className="relative z-10 select-none filter drop-shadow-xs">
            {value || '🎁'}
          </span>
        </motion.div>

        {/* Custom Input */}
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            maxLength={4}
            placeholder="🎁"
            className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-100 font-body text-base focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all"
          />
          <span className="text-[10px] text-stone-400 px-1">Puedes escribir cualquier emoji del teclado</span>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={cn(
            'px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer select-none font-display',
            activeCategory === 'all'
              ? 'bg-amber-500 text-white shadow-soft scale-[1.02]'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
          )}
        >
          Todos ({ALL_REWARD_ICONS.length})
        </button>
        {REWARD_ICON_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer select-none font-display',
              activeCategory === cat.id
                ? 'bg-amber-500 text-white shadow-soft scale-[1.02]'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid of Expressive Reward Icons */}
      <div className="bg-stone-50/80 dark:bg-stone-850/80 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto">
        {displayedIcons.map(icon => {
          const isSelected = value === icon;
          return (
            <motion.button
              key={icon}
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(icon)}
              className={cn(
                'h-10 text-2xl flex items-center justify-center rounded-xl transition-all cursor-pointer select-none border',
                isSelected
                  ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 dark:border-amber-600 shadow-soft scale-105'
                  : 'bg-white dark:bg-stone-800 border-stone-200/60 dark:border-stone-750 hover:bg-stone-100 dark:hover:bg-stone-700'
              )}
            >
              {icon}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
