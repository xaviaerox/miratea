'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Wand2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface GoalProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setTitle: (val: string) => void;
  why: string;
  setWhy: (val: string) => void;
  steps?: string[];
  setStepValue?: (index: number, val: string) => void;
  addStep?: () => void;
  removeStep?: (index: number) => void;
  setTargetStepCount?: (count: number) => void;
  submitting: boolean;
  error: string;
  isGeneratingAI: boolean;
  onAIDecompose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  // Legacy backward compatibility
  step1?: string;
  setStep1?: (val: string) => void;
  step2?: string;
  setStep2?: (val: string) => void;
  step3?: string;
  setStep3?: (val: string) => void;
}

export function GoalProposalModal({
  isOpen,
  onClose,
  title,
  setTitle,
  why,
  setWhy,
  steps: stepsProp,
  setStepValue: setStepValueProp,
  addStep: addStepProp,
  removeStep: removeStepProp,
  setTargetStepCount: setTargetStepCountProp,
  submitting,
  error,
  isGeneratingAI,
  onAIDecompose,
  onSubmit,
  step1,
  setStep1,
  step2,
  setStep2,
  step3,
  setStep3,
}: GoalProposalModalProps) {
  if (!isOpen) return null;

  // Fallback to stepsProp or legacy step1, step2, step3
  const currentSteps: string[] =
    stepsProp && stepsProp.length > 0
      ? stepsProp
      : [step1 || '', step2 || '', step3 || ''];

  const handleStepChange = (idx: number, val: string) => {
    if (setStepValueProp) {
      setStepValueProp(idx, val);
    } else if (idx === 0 && setStep1) {
      setStep1(val);
    } else if (idx === 1 && setStep2) {
      setStep2(val);
    } else if (idx === 2 && setStep3) {
      setStep3(val);
    }
  };

  const handleAddStep = () => {
    if (addStepProp) {
      addStepProp();
    }
  };

  const handleRemoveStep = (idx: number) => {
    if (removeStepProp) {
      removeStepProp(idx);
    }
  };

  const handleSetTargetCount = (count: number) => {
    if (setTargetStepCountProp) {
      setTargetStepCountProp(count);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg rounded-3xl border border-stone-200/80 bg-[#FAF9F7] p-6 sm:p-8 text-stone-800 shadow-2xl overflow-hidden max-h-[90dvh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 rounded-full p-2 text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200/60">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#1B3A52]">
                Proponer Aventura / Meta
              </h2>
              <p className="text-xs text-stone-500 font-body">
                Describe tu nuevo objetivo y organiza los micropasos para lograrlo.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4.5 mt-5">
            {/* Title & AI Decomposition Button */}
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5 font-body">
                ¿Qué te gustaría lograr? (Título) *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Aprender a ir en bici o recoger mi cuarto"
                  required
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-bloom-300 text-sm font-medium font-body"
                />
                <Button
                  type="button"
                  onClick={onAIDecompose}
                  disabled={!title.trim() || isGeneratingAI}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold font-body text-xs rounded-2xl px-4 py-2.5 whitespace-nowrap flex items-center justify-center gap-1.5 shadow-soft shrink-0"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  {isGeneratingAI ? 'Pensando pasos...' : '✨ Sugerir con Lumi'}
                </Button>
              </div>
            </div>

            {/* Why (Optional) */}
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5 font-body">
                ¿Por qué es importante para ti? (Opcional)
              </label>
              <textarea
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder="Ej: Porque me divertiré mucho y me sentiré muy orgulloso/a"
                rows={2}
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-bloom-300 text-xs font-body resize-none"
              />
            </div>

            {/* Microtasks Steps Section */}
            <div className="space-y-3 pt-1 border-t border-stone-200/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-800 uppercase tracking-wider font-body flex items-center gap-1.5">
                  <span>◈</span> Pasos de la Aventura ({currentSteps.length})
                </label>

                {/* Step Count Selector */}
                {setTargetStepCountProp && (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-stone-400 font-medium font-body mr-1">
                      Nº Pasos:
                    </span>
                    {[2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSetTargetCount(num)}
                        className={`w-6 h-6 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentSteps.length === num
                            ? 'bg-amber-500 text-white shadow-xs scale-105'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                        title={`Cambiar a ${num} pasos`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Steps Inputs */}
              <div className="space-y-2">
                {currentSteps.map((stepVal, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0 font-body">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={stepVal}
                      onChange={(e) => handleStepChange(idx, e.target.value)}
                      placeholder={`Paso ${idx + 1}: ${
                        idx === 0
                          ? 'Primer paso pequeñito (Fácil)'
                          : idx === 1
                          ? 'Practicar un poco más (Medio)'
                          : idx === currentSteps.length - 1
                          ? '¡Completar el gran reto! (Desafío)'
                          : 'Avanzar con constancia'
                      }`}
                      className="flex-1 px-3.5 py-2 rounded-2xl border border-stone-200 bg-white text-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-bloom-300 font-body"
                    />
                    {currentSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-100 rounded-xl transition-colors shrink-0"
                        title="Eliminar paso"
                        aria-label={`Eliminar paso ${idx + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Step Button */}
              <button
                type="button"
                onClick={handleAddStep}
                className="w-full py-2.5 rounded-2xl border border-dashed border-stone-300 hover:border-amber-400 bg-white/70 hover:bg-amber-50/50 text-stone-600 hover:text-amber-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-body shadow-xs mt-1"
              >
                <Plus className="h-4 w-4 text-amber-500" />
                Añadir otro paso
              </button>
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-50 p-2.5 rounded-2xl border border-red-100 text-center font-body">
                {error}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 flex gap-3 font-body">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1 rounded-2xl font-bold border border-stone-200 text-stone-600 hover:bg-stone-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={submitting}
                className="flex-1 bg-bloom-500 hover:bg-bloom-600 text-white font-bold rounded-2xl shadow-soft flex items-center justify-center gap-1"
              >
                <Plus className="h-4 w-4 mr-1" />
                Enviar Sugerencia
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
