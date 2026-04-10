import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './persist';
import type { SalaryInputType, SalaryMode, SalaryPeriod, SalaryResults, SimulationHistoryItem } from '../types';
import { recalculateFromInput, recalculateFromField, emptyResults } from '../utils/salary';
import { parseInputAmount } from '../utils/format';
import { generateId } from '../utils/ids';

const MAX_HISTORY = 10;
const MAX_RECENT_VALUES = 5;

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

  setInputValue: (value: string) => void;
  setInputType: (type: SalaryInputType) => void;
  setPeriod: (period: SalaryPeriod) => void;
  setMode: (mode: SalaryMode) => void;
  setActiveField: (field: keyof SalaryResults | 'input') => void;
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
  const value = parseInputAmount(state.inputValue);
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

      setInputValue: (value) => {
        set((state) => {
          const results = computeResults({ ...state, inputValue: value });
          const numValue = parseInputAmount(value);
          const recentValues = numValue > 0 ? addToRecent(state.recentValues, numValue) : state.recentValues;
          return { inputValue: value, results, recentValues, activeField: 'input' };
        });
      },

      setInputType: (type) => {
        set((state) => {
          const results = computeResults({ ...state, inputType: type });
          return { inputType: type, results };
        });
      },

      setPeriod: (period) => {
        set((state) => {
          const results = computeResults({ ...state, period });
          return { period, results };
        });
      },

      setMode: (mode) => set({ mode }),

      setActiveField: (field) => set({ activeField: field }),

      updateFromField: (field, value) => {
        const state = get();
        const results = recalculateFromField(value, field, {
          taxRate: state.taxRate,
          pasEnabled: state.pasEnabled,
          pasRate: state.pasRate,
          monthsPerYear: state.monthsPerYear,
        });
        const isGross = field.startsWith('gross');
        let inputValue: string;
        if (field.includes('Monthly')) {
          inputValue = value.toString();
        } else if (field.includes('Yearly')) {
          inputValue = (isGross ? results.grossMonthly : results.netMonthly).toString();
        } else {
          inputValue = (isGross ? results.grossMonthly : results.netMonthly).toString();
        }
        set({
          results,
          inputValue,
          inputType: isGross ? 'gross' : 'net',
          period: 'monthly',
          activeField: field,
        });
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
          const results = computeResults({
            ...state,
            inputValue,
            inputType: 'gross',
            period: 'monthly',
          });
          return {
            inputValue,
            inputType: 'gross' as const,
            period: 'monthly' as const,
            results,
            activeField: 'input' as const,
          };
        });
      },

      addQuickAmount: (amount) => {
        set((state) => {
          const current = parseInputAmount(state.inputValue);
          const newValue = Math.max(0, current + amount);
          const inputValue = newValue.toString();
          const results = computeResults({ ...state, inputValue });
          return { inputValue, results };
        });
      },

      saveSimulation: (title) => {
        const state = get();
        const value = parseInputAmount(state.inputValue);
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
        };
        set((s) => ({
          history: [item, ...s.history].slice(0, MAX_HISTORY),
        }));
      },

      loadSimulation: (item) => {
        set({
          inputValue: item.inputValue.toString(),
          inputType: item.inputType,
          period: item.period,
          results: item.results,
          activeField: 'input',
        });
      },

      deleteHistoryItem: (id) => {
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        }));
      },

      renameHistoryItem: (id, title) => {
        set((state) => ({
          history: state.history.map((h) =>
            h.id === id ? { ...h, title } : h
          ),
        }));
      },

      clearHistory: () => set({ history: [], recentValues: [] }),

      resetInput: () => set({ inputValue: '', results: emptyResults(), activeField: 'input' }),

      reset: () =>
        set({
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
        }),
    }),
    {
      name: 'salary-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
