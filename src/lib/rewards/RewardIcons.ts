export interface RewardIconCategory {
  id: string;
  name: string;
  icons: string[];
}

export const REWARD_ICON_CATEGORIES: RewardIconCategory[] = [
  {
    id: 'outings_food',
    name: 'Salidas y Comida 🍦',
    icons: ['🏊', '🍦', '🍕', '🍿', '🚲', '🎡', '🏕️', '🍰', '🍔', '🍟', '🍩', '🧃'],
  },
  {
    id: 'games_leisure',
    name: 'Juegos y Tiempo Libre 🎮',
    icons: ['🎮', '🧩', '🎨', '⚽', '📚', '🎵', '🎲', '🛹', '🎳', '🎯', '🎸', '🎬'],
  },
  {
    id: 'rewards_perks',
    name: 'Premios y Privilegios ⭐',
    icons: ['⭐', '🎁', '👑', '🧸', '🛌', '📱', '🌟', '🏆', '💎', '🦄', '🎉', '🚀'],
  },
];

export const ALL_REWARD_ICONS = REWARD_ICON_CATEGORIES.flatMap(c => c.icons);
