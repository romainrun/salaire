import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorageAdapter } from './persist';
import type { UseCase } from '../types';
import { defaultCountry } from '../data';

interface OnboardingState {
  country: string;
  currency: string;
  useCase: UseCase;
  pasEnabled: boolean;
  pasRate: number;
  workHoursPerWeek: number;
  monthsPerYear: number;
  workload: number;
  status: string;
  isCompleted: boolean;
  missingCountryMessage: string;

  setCountry: (code: string, currency: string) => void;
  setUseCase: (useCase: UseCase) => void;
  setPasEnabled: (enabled: boolean) => void;
  setPasRate: (rate: number) => void;
  setWorkHoursPerWeek: (hours: number) => void;
  setMonthsPerYear: (months: number) => void;
  setWorkload: (workload: number) => void;
  setMissingCountryMessage: (msg: string) => void;
  setOnboarding: (patch: Partial<OnboardingState>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      country: defaultCountry.code,
      currency: defaultCountry.currency,
      useCase: 'convert',
      pasEnabled: false,
      pasRate: 0,
      workHoursPerWeek: 35,
      monthsPerYear: 12,
      workload: 100,
      status: '',
      isCompleted: false,
      missingCountryMessage: '',

      setCountry: (code, currency) => set({ country: code, currency }),
      setUseCase: (useCase) => set({ useCase }),
      setPasEnabled: (enabled) => set({ pasEnabled: enabled }),
      setPasRate: (rate) => set({ pasRate: rate }),
      setWorkHoursPerWeek: (hours) => set({ workHoursPerWeek: hours }),
      setMonthsPerYear: (months) => set({ monthsPerYear: months }),
      setWorkload: (workload) => set({ workload }),
      setMissingCountryMessage: (msg) => set({ missingCountryMessage: msg }),
      setOnboarding: (patch) => set((state) => ({ ...state, ...patch })),
      completeOnboarding: () => set({ isCompleted: true }),
      resetOnboarding: () =>
        set({
          country: defaultCountry.code,
          currency: defaultCountry.currency,
          useCase: 'convert',
          pasEnabled: false,
          pasRate: 0,
          workHoursPerWeek: 35,
          monthsPerYear: 12,
          workload: 100,
          status: '',
          isCompleted: false,
          missingCountryMessage: '',
        }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
