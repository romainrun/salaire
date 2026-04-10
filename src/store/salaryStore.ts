import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorageAdapter } from './persist';
import type { SalaryInputType, SalaryMode, SalaryResults, SimulationHistoryItem } from '../types';
import { recalculateFromInput, emptyResults } from '../utils/salary';
import { parseInputAmount } from '../utils/format';
import { generateId } from '../utils/ids';

interface SalaryState {
  inputValue: string;
  inputType: SalaryInputType;
  mode: SalaryMode;
  results: SalaryResults;
  history: SimulationHistoryItem[];
  taxRate: number;
  pasEnabled: boolean;
  pasRate: number;
  workHoursPerWeek: number;
  monthsPerYear: number;

  setInputValue: (value: string) => void;
  setInputType: (type: SalaryInputType) => void;
  setMode: (mode: SalaryMode) => void;
  recalculate: () => void;
  initializeFromSettings: (settings: {
    taxRate: number;
    pasEnabled: boolean;
    pasRate: number;
    workHoursPerWeek: number;
    monthsPerYear: number;
  }) => void;
  recomputeFromSettings: (settings: {
    taxRate: number;
    pasEnabled: boolean;
    pasRate: number;
    monthsPerYear: number;
  }) => void;
  saveSimulation: (title: string) => void;
  addHistoryItem: (item: SimulationHistoryItem) => void;
  clearHistory: () => void;
  resetInput: () => void;
  resetSalaryData: () => void;
  reset: () => void;
}

function computeResults(state: {
  inputValue: string;
  inputType: SalaryInputType;
  taxRate: number;
  pasEnabled: boolean;
  pasRate: number;
  monthsPerYear: number;
}): SalaryResults {
  const value = parseInputAmount(state.inputValue);
  return recalculateFromInput(value, state.inputType, {
    taxRate: state.taxRate,
    pasEnabled: state.pasEnabled,
    pasRate: state.pasRate,
    monthsPerYear: state.monthsPerYear,
  });
}

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set, get) => ({
      inputValue: '',
      inputType: 'gross',
      mode: 'simple',
      results: emptyResults(),
      history: [],
      taxRate: 0.23,
      pasEnabled: false,
      pasRate: 0,
      workHoursPerWeek: 35,
      monthsPerYear: 12,

      setInputValue: (value) => {
        set((state) => {
          const results = computeResults({ ...state, inputValue: value });
          return { inputValue: value, results };
        });
      },

      setInputType: (type) => {
        set((state) => {
          const results = computeResults({ ...state, inputType: type });
          return { inputType: type, results };
        });
      },

      setMode: (mode) => set({ mode }),

      recalculate: () => {
        set((state) => ({
          results: computeResults(state),
        }));
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

      saveSimulation: (title) => {
        const state = get();
        const value = parseInputAmount(state.inputValue);
        const item: SimulationHistoryItem = {
          id: generateId(),
          title,
          createdAt: new Date().toISOString(),
          inputType: state.inputType,
          inputValue: value,
          taxRate: state.taxRate,
          pasEnabled: state.pasEnabled,
          pasRate: state.pasRate,
          results: state.results,
        };
        set((s) => ({ history: [item, ...s.history] }));
      },

      addHistoryItem: (item) => {
        set((state) => ({ history: [item, ...state.history] }));
      },

      clearHistory: () => set({ history: [] }),

      resetInput: () =>
        set({ inputValue: '', results: emptyResults() }),

      resetSalaryData: () =>
        set({
          inputValue: '',
          inputType: 'gross',
          mode: 'simple',
          results: emptyResults(),
          history: [],
        }),

      reset: () =>
        set({
          inputValue: '',
          inputType: 'gross',
          mode: 'simple',
          results: emptyResults(),
          history: [],
          taxRate: 0.23,
          pasEnabled: false,
          pasRate: 0,
          workHoursPerWeek: 35,
          monthsPerYear: 12,
        }),
    }),
    {
      name: 'salary-storage',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
