import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './persist';
import type { SalaryInputType, SalaryMode, SalaryPeriod, SalaryResults, SimulationHistoryItem, AdvancedOptions } from '../types';
import { recalculateFromInput, recalculateFromField, emptyResults } from '../utils/salary';
import { parseSalaryInput } from '../utils/parseSalaryInput';
import { generateId } from '../utils/ids';
import { usePremiumStore } from './premiumStore';

const MAX_HISTORY = 20;
const MAX_RECENT_VALUES = 5;
const FREE_HISTORY_LIMIT = 3;

interface SalaryState {
  inputValue: string;
  inputType: SalaryInputType;
  period: SalaryPeriod;
  mode: SalaryMode;
  results: SalaryResults;
  history: SimulationHistoryItem[];
  recentValues: number[];
  taxRate: number;
  pasEnabled: boolean;
  pasRate: number;
  workHoursPerWeek: number;
  monthsPerYear: number;
  countryCode: string;
  activeField: keyof SalaryResults | 'input';
  autoSaveEnabled: boolean;
  advanced: AdvancedOptions;
  displayCurrency: string;

  setInputValue: (value: string) => void;
  setInputType: (type: SalaryInputType) => void;
  setPeriod: (period: SalaryPeriod) => void;
  setMode: (mode: SalaryMode) => void;
  setActiveField: (field: keyof SalaryResults | 'input') => void;
  setDisplayCurrency: (code: string) => void;
  setAdvanced: (patch: Partial<AdvancedOptions>) => void;
  updateFromField: (field: keyof SalaryResults, value: number) => void;
  recalculate: () => void;
  initializeFromSettings: (settings: {
    taxRate: number;
    pasEnabled: boolean;
    pasRate: number;
    workHoursPerWeek: number;
    monthsPerYear: number;
    countryCode: string;
  }) => void;
  recomputeFromSettings: (settings: {
    taxRate: number;
    pasEnabled: boolean;
    pasRate: number;
    monthsPerYear: number;
  }) => void;
  fillSmic: (smicValue: number) => void;
  addQuickAmount: (amount: number) => void;
  saveSimulation: (title: string) => void;
  loadSimulation: (item: SimulationHistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  renameHistoryItem: (id: string, title: string) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
  resetInput: () => void;
  reset: () => void;
}

function computeResults(state: {
  inputValue: string;
  inputType: SalaryInputType;
  period: SalaryPeriod;
  taxRate: number;
  pasEnabled: boolean;
  pasRate: number;
  monthsPerYear: number;
}): SalaryResults {
  const value = parseSalaryInput(state.inputValue);
  return recalculateFromInput(value, state.inputType, state.period, {
    taxRate: state.taxRate,
    pasEnabled: state.pasEnabled,
    pasRate: state.pasRate,
    monthsPerYear: state.monthsPerYear,
  });
}

function addToRecent(recentValues: number[], value: number): number[] {
  if (value <= 0) return recentValues;
  const filtered = recentValues.filter((v) => v !== value);
  return [value, ...filtered].slice(0, MAX_RECENT_VALUES);
}

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set, get) => ({
      inputValue: '',
      inputType: 'gross',
      period: 'monthly',
      mode: 'simple',
      results: emptyResults(),
      history: [],
      recentValues: [],
      taxRate: 0.23,
      pasEnabled: false,
      pasRate: 0,
      workHoursPerWeek: 35,
      monthsPerYear: 12,
      countryCode: 'FR',
      activeField: 'input',
      autoSaveEnabled: true,
      advanced: { bonus: 0, thirteenthMonth: false, customWorkDays: 260 },
      displayCurrency: 'EUR',

      setInputValue: (value) => {
        set((state) => {
          const results = computeResults({ ...state, inputValue: value });
          const numValue = parseSalaryInput(value);
          const recentValues = numValue > 0 ? addToRecent(state.recentValues, numValue) : state.recentValues;
          return { inputValue: value, results, recentValues, activeField: 'input' };
        });
      },

      setInputType: (type) => {
        set((state) => ({ inputType: type, results: computeResults({ ...state, inputType: type }) }));
      },

      setPeriod: (period) => {
        set((state) => ({ period, results: computeResults({ ...state, period }) }));
      },

      setMode: (mode) => {
        const premium = usePremiumStore.getState();
        const isAdvancedAllowed =
          premium.isPremium || premium.isFeatureUnlocked('advancedOptions');
        if (mode === 'advanced' && !isAdvancedAllowed) {
          return;
        }
        set({ mode });
      },
      setActiveField: (field) => set({ activeField: field }),
      setDisplayCurrency: (code) => set({ displayCurrency: code }),

      setAdvanced: (patch) => {
        set((state) => ({ advanced: { ...state.advanced, ...patch } }));
      },

      updateFromField: (field, value) => {
        const state = get();
        const results = recalculateFromField(value, field, {
          taxRate: state.taxRate,
          pasEnabled: state.pasEnabled,
          pasRate: state.pasRate,
          monthsPerYear: state.monthsPerYear,
        });
        const isGross = field.startsWith('gross');
        const inputValue = (isGross ? results.grossMonthly : results.netMonthly).toString();
        set({ results, inputValue, inputType: isGross ? 'gross' : 'net', period: 'monthly', activeField: field });
      },

      recalculate: () => {
        set((state) => ({ results: computeResults(state) }));
      },

      initializeFromSettings: (settings) => {
        set((state) => {
          const newState = { ...state, ...settings };
          return { ...settings, results: computeResults(newState) };
        });
      },

      recomputeFromSettings: (settings) => {
        set((state) => {
          const newState = { ...state, ...settings };
          return { ...settings, results: computeResults(newState) };
        });
      },

      fillSmic: (smicValue) => {
        set((state) => {
          const inputValue = smicValue.toString();
          const results = computeResults({ ...state, inputValue, inputType: 'gross', period: 'monthly' });
          return { inputValue, inputType: 'gross' as const, period: 'monthly' as const, results, activeField: 'input' as const };
        });
      },

      addQuickAmount: (amount) => {
        set((state) => {
          const current = parseSalaryInput(state.inputValue);
          const newValue = Math.max(0, current + amount);
          const inputValue = newValue.toString();
          return { inputValue, results: computeResults({ ...state, inputValue }) };
        });
      },

      saveSimulation: (title) => {
        const state = get();
        const value = parseSalaryInput(state.inputValue);
        if (value <= 0) return;
        const premiumState = usePremiumStore.getState();
        const hasUnlimitedHistory =
          premiumState.isPremium || premiumState.isFeatureUnlocked('history');
        if (!hasUnlimitedHistory && state.history.length >= FREE_HISTORY_LIMIT) {
          return;
        }
        const item: SimulationHistoryItem = {
          id: generateId(),
          title: title || `Simulation du ${new Date().toLocaleDateString('fr-FR')}`,
          createdAt: new Date().toISOString(),
          inputType: state.inputType,
          inputValue: value,
          period: state.period,
          taxRate: state.taxRate,
          pasEnabled: state.pasEnabled,
          pasRate: state.pasRate,
          countryCode: state.countryCode,
          results: state.results,
          favorite: false,
        };
        set((s) => ({ history: [item, ...s.history].slice(0, MAX_HISTORY) }));
      },

      loadSimulation: (item) => {
        set({ inputValue: item.inputValue.toString(), inputType: item.inputType, period: item.period, results: item.results, activeField: 'input' });
      },

      deleteHistoryItem: (id) => {
        set((state) => ({ history: state.history.filter((h) => h.id !== id) }));
      },

      renameHistoryItem: (id, title) => {
        set((state) => ({ history: state.history.map((h) => h.id === id ? { ...h, title } : h) }));
      },

      toggleFavorite: (id) => {
        set((state) => ({
          history: state.history.map((h) => h.id === id ? { ...h, favorite: !h.favorite } : h),
        }));
      },

      clearHistory: () => set({ history: [], recentValues: [] }),
      resetInput: () => set({ inputValue: '', results: emptyResults(), activeField: 'input' }),

      reset: () =>
        set({
          inputValue: '', inputType: 'gross', period: 'monthly', mode: 'simple',
          results: emptyResults(), history: [], recentValues: [],
          taxRate: 0.23, pasEnabled: false, pasRate: 0, workHoursPerWeek: 35,
          monthsPerYear: 12, countryCode: 'FR', activeField: 'input',
          advanced: { bonus: 0, thirteenthMonth: false, customWorkDays: 260 },
          displayCurrency: 'EUR',
        }),
    }),
    { name: 'salary-storage', storage: createJSONStorage(() => zustandStorage) }
  )
);
