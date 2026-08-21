'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useCompanion } from '@/lib/companion/CompanionProvider';
import { supabase } from '@/lib/supabase';
import { ChildAvatar } from '../ui/ChildAvatar';
import { CompanionBlob } from './CompanionBlob';
import { CUSTOMIZATION_ITEMS, type CustomizationItem } from '@/lib/customization/CustomizationItems';
import { Palette, Sparkles, Smile } from 'lucide-react';
import { getSparkAdapter, isUseSupabase } from '@/lib/adapters';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sparkBalance: number;
  onPurchaseSuccess: () => void; // Callback to fetch new spark balance in parent
}

const EMOJI_OPTIONS = ['🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐰', '🐙', '🦄', '🦖', '🐒', '🦉', '🤖', '🧙'];

export function CustomizationModal({ isOpen, onClose, sparkBalance, onPurchaseSuccess }: CustomizationModalProps) {
  const { profile, updateProfile } = useAuth();
  const { companion, updateCompanionCustomization } = useCompanion();
  const [activeTab, setActiveTab] = useState<'avatar' | 'companion'>('avatar');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [companionName, setCompanionName] = useState(companion?.name || '');
  const [prevName, setPrevName] = useState(companion?.name);
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (companion?.name && companion.name !== prevName) {
    setPrevName(companion.name);
    setCompanionName(companion.name);
  }

  async function handleRenameCompanion() {
    if (!companionName.trim() || !companion) return;
    setRenaming(true);
    const ok = await updateCompanionCustomization({ name: companionName.trim() });
    if (!ok) {
      alert('Error al renombrar a tu compañero');
    }
    setRenaming(false);
  }

  if (!profile || profile.role !== 'child') return null;

  const unlocked = profile.unlocked_accessories || [];
  const currentAvatarAcc = profile.avatar_accessory || null;
  const currentAvatarEmoji = profile.avatar_base_emoji || '🦊';

  const companionAcc = companion?.equipped_accessory || null;
  const companionTheme = companion?.equipped_color_theme || null;

  async function handleBuyItem(item: CustomizationItem) {
    if (!profile) return;
    if (sparkBalance < item.cost) {
      alert('¡No tienes suficientes estrellas! Completa más rutinas para ganar Sparks ✦');
      return;
    }

    setBuyingId(item.id);

    // 1. Deduct sparks depending on active data source
    if (isUseSupabase()) {
      const { error: sparkError } = await supabase.rpc('award_sparks', {
        p_child_id: profile.id,
        p_delta: -item.cost,
        p_source_type: 'customization_purchase',
        p_note: `Tienda: Comprado ${item.name}`
      });

      if (sparkError) {
        alert('Error en la compra: ' + sparkError.message);
        setBuyingId(null);
        return;
      }
    } else {
      const sparkAdapter = getSparkAdapter();
      const res = await sparkAdapter.awardBonus(
        profile.id,
        profile.family_id || 'static-family-id',
        -item.cost,
        `Tienda: Comprado ${item.name}`,
        'static-parent-id'
      );
      if (!res.ok) {
        alert('Error en la compra: ' + (res.error?.message ?? 'error'));
        setBuyingId(null);
        return;
      }
    }

    // 2. Add item to unlocked list in profile
    const updatedUnlocked = [...unlocked, item.id];
    const profileRes = await updateProfile({
      unlocked_accessories: updatedUnlocked
    });

    if (!profileRes.ok) {
      alert('Error al guardar el accesorio desbloqueado: ' + (profileRes.error?.message ?? 'error'));
      setBuyingId(null);
      return;
    }

    // Play a gentle confirm chime (Web Audio)
    playPurchaseChime();
    setBuyingId(null);
    onPurchaseSuccess();
  }

  function playPurchaseChime() {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    try {
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  async function handleEquipAvatar(item: CustomizationItem) {
    const isEquipped = currentAvatarAcc === item.value;
    const { ok } = await updateProfile({
      avatar_accessory: isEquipped ? null : item.value
    });
    if (!ok) alert('Error al equipar el accesorio');
  }

  async function handleEquipCompanion(item: CustomizationItem) {
    if (item.type === 'accessory') {
      const isEquipped = companionAcc === item.value;
      const ok = await updateCompanionCustomization({
        equipped_accessory: isEquipped ? null : item.value
      });
      if (!ok) alert('Error al equipar el accesorio del compañero');
    } else {
      const isEquipped = companionTheme === item.value;
      const ok = await updateCompanionCustomization({
        equipped_color_theme: isEquipped ? null : item.value
      });
      if (!ok) alert('Error al aplicar el estilo del compañero');
    }
  }

  async function handleSelectEmoji(emoji: string) {
    await updateProfile({
      avatar_base_emoji: emoji
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
          />

          {/* Modal Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="customization-modal-title"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            className="relative w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh] z-10"
          >
            {/* Header */}
            <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-850/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="customization-modal-title" className="font-display text-xl font-bold text-stone-850 dark:text-stone-100">
                    Armario de Estrellas
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5 font-body">
                    Personaliza tu personaje y el aspecto de tu compañero
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-3.5 py-1.5 rounded-2xl shadow-soft">
                <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400 font-body">
                  {sparkBalance} Sparks ✦
                </span>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-stone-100 dark:border-stone-800 text-xs font-bold font-display uppercase tracking-wider" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'avatar'}
                onClick={() => setActiveTab('avatar')}
                className={`flex-1 py-3 text-center transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer focus:outline-none ${
                  activeTab === 'avatar'
                    ? 'border-bloom-500 text-bloom-600 dark:text-bloom-400 bg-bloom-50/40 dark:bg-bloom-950/20'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                <Smile className="w-4 h-4 text-bloom-500" />
                <span>Mi Personaje</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'companion'}
                onClick={() => setActiveTab('companion')}
                className={`flex-1 py-3 text-center transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer focus:outline-none ${
                  activeTab === 'companion'
                    ? 'border-bloom-500 text-bloom-600 dark:text-bloom-400 bg-bloom-50/40 dark:bg-bloom-950/20'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Mi Compañero</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* TAB 1: AVATAR */}
              {activeTab === 'avatar' && (
                <>
                  {/* PREVIEW CARD */}
                  <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-500/10 via-amber-50/40 to-white dark:from-stone-850 dark:to-stone-900 rounded-3xl border border-amber-200/70 dark:border-stone-800 shadow-soft relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12),transparent_70%)] pointer-events-none" />
                    <ChildAvatar
                      baseEmoji={currentAvatarEmoji}
                      accessory={currentAvatarAcc}
                      size="xl"
                      className="shadow-md"
                    />
                    <span className="text-xs text-stone-500 font-bold mt-3 font-display tracking-wide">
                      Vista previa de tu avatar
                    </span>
                  </div>

                  {/* BASE VECTOR AVATAR SELECTION */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-display">
                      Elige tu personaje base (Gratis)
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleSelectEmoji(emoji)}
                          className={`
                            p-1.5 rounded-2xl border transition-all active:scale-[0.92] cursor-pointer flex items-center justify-center
                            ${
                              currentAvatarEmoji === emoji
                                ? 'bg-amber-100/80 border-amber-400 shadow-soft scale-105 ring-2 ring-amber-300/60'
                                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-amber-50/50'
                            }
                          `}
                        >
                          <ChildAvatar baseEmoji={emoji} size="sm" interactive={false} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ACCESSORY STORE/WARDROBE */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                      Accesorios de cabeza y cara
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CUSTOMIZATION_ITEMS.filter(i => i.type === 'accessory').map(item => {
                        const isUnlocked = unlocked.includes(item.id);
                        const isEquipped = currentAvatarAcc === item.value;
                        const isBuying = buyingId === item.id;

                        return (
                          <div
                            key={item.id}
                            className={`
                              flex items-center justify-between p-3 rounded-2xl border transition-all
                              ${
                                isEquipped
                                  ? 'bg-bloom-50/20 border-bloom-300 dark:border-bloom-800/80 shadow-sm'
                                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl p-2 bg-stone-50 dark:bg-stone-850 rounded-xl">
                                {item.emoji}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-stone-700 dark:text-stone-250">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-stone-400 leading-tight pr-1">
                                  {item.description}
                                </span>
                              </div>
                            </div>

                            <button
                              disabled={isBuying}
                              onClick={() => {
                                if (isUnlocked) {
                                  handleEquipAvatar(item);
                                } else {
                                  handleBuyItem(item);
                                }
                              }}
                              className={`
                                text-[10px] font-extrabold px-3 py-2 rounded-xl transition-all active:scale-[0.96] cursor-pointer
                                ${
                                  isEquipped
                                    ? 'bg-amber-500 text-white shadow-soft'
                                    : isUnlocked
                                    ? 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
                                }
                              `}
                            >
                              {isEquipped
                                ? 'Puesto'
                                : isUnlocked
                                ? 'Equipar'
                                : `Comprar (${item.cost} ✦)`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: COMPANION */}
              {activeTab === 'companion' && (
                <>
                  {/* PREVIEW */}
                  <div className="flex flex-col items-center justify-center p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-150 dark:border-stone-800 min-h-[170px]">
                    {companion ? (
                      <CompanionBlob
                        stage={companion.stage}
                        size="lg"
                        customTheme={companionTheme}
                        customAccessory={companionAcc}
                      />
                    ) : (
                      <div className="w-16 h-16 border-2 border-stone-200 border-t-bloom-400 rounded-full animate-spin" />
                    )}
                    <div className="flex flex-col items-center gap-1.5 w-full mt-3">
                      <div className="flex items-center gap-2 w-full max-w-xs justify-center">
                        <input
                          type="text"
                          value={companionName}
                          onChange={(e) => setCompanionName(e.target.value)}
                          className="text-center text-base font-bold text-stone-850 dark:text-stone-100 bg-transparent border-b border-transparent focus:border-stone-300 dark:focus:border-stone-750 focus:outline-none px-2 py-0.5 w-full max-w-[180px] hover:bg-stone-100/50 dark:hover:bg-stone-800 rounded transition-all"
                          placeholder="Nombre de tu compañero..."
                          maxLength={20}
                        />
                        {companionName !== (companion?.name || '') && (
                          <button
                            onClick={handleRenameCompanion}
                            disabled={renaming || !companionName.trim()}
                            className="text-[10px] font-extrabold px-3 py-1.5 bg-bloom-50 hover:bg-bloom-100 text-bloom-600 rounded-xl cursor-pointer transition-colors shadow-soft"
                          >
                            {renaming ? 'Guardando...' : 'Guardar'}
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 font-semibold">
                        Haz clic en el nombre arriba para cambiarlo ✏_
                      </span>
                    </div>
                  </div>

                  {/* COMPANION ACCESSORIES */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                      Accesorios para equipar
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CUSTOMIZATION_ITEMS.filter(i => i.type === 'accessory').map(item => {
                        const isUnlocked = unlocked.includes(item.id);
                        const isEquipped = companionAcc === item.value;
                        const isBuying = buyingId === item.id;

                        return (
                          <div
                            key={item.id}
                            className={`
                              flex items-center justify-between p-3 rounded-2xl border transition-all
                              ${
                                isEquipped
                                  ? 'bg-bloom-50/20 border-bloom-300 dark:border-bloom-800/80 shadow-sm'
                                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl p-2 bg-stone-50 dark:bg-stone-850 rounded-xl">
                                {item.emoji}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-stone-700 dark:text-stone-250">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-stone-400 leading-tight pr-1">
                                  {item.description}
                                </span>
                              </div>
                            </div>

                            <button
                              disabled={isBuying}
                              onClick={() => {
                                if (isUnlocked) {
                                  handleEquipCompanion(item);
                                } else {
                                  handleBuyItem(item);
                                }
                              }}
                              className={`
                                text-[10px] font-extrabold px-3 py-2 rounded-xl transition-all active:scale-[0.96] cursor-pointer
                                ${
                                  isEquipped
                                    ? 'bg-amber-500 text-white shadow-soft'
                                    : isUnlocked
                                    ? 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
                                }
                              `}
                            >
                              {isEquipped
                                ? 'Puesto'
                                : isUnlocked
                                ? 'Equipar'
                                : `Comprar (${item.cost} ✦)`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COMPANION SKINS/THEMES */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                      Pieles y colores de energía
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CUSTOMIZATION_ITEMS.filter(i => i.type === 'theme').map(item => {
                        const isUnlocked = unlocked.includes(item.id);
                        const isEquipped = companionTheme === item.value;
                        const isBuying = buyingId === item.id;

                        return (
                          <div
                            key={item.id}
                            className={`
                              flex items-center justify-between p-3 rounded-2xl border transition-all
                              ${
                                isEquipped
                                  ? 'bg-bloom-50/20 border-bloom-300 dark:border-bloom-800/80 shadow-sm'
                                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl p-2 bg-stone-50 dark:bg-stone-850 rounded-xl">
                                {item.emoji}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-stone-700 dark:text-stone-250">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-stone-400 leading-tight pr-1">
                                  {item.description}
                                </span>
                              </div>
                            </div>

                            <button
                              disabled={isBuying}
                              onClick={() => {
                                if (isUnlocked) {
                                  handleEquipCompanion(item);
                                } else {
                                  handleBuyItem(item);
                                }
                              }}
                              className={`
                                text-[10px] font-extrabold px-3 py-2 rounded-xl transition-all active:scale-[0.96] cursor-pointer
                                ${
                                  isEquipped
                                    ? 'bg-amber-500 text-white shadow-soft'
                                    : isUnlocked
                                    ? 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
                                }
                              `}
                            >
                              {isEquipped
                                ? 'Puesto'
                                : isUnlocked
                                ? 'Usar'
                                : `Comprar (${item.cost} ✦)`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-bold text-sm rounded-xl cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
