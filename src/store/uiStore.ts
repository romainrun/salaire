import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorageAdapter } from './persist';
import type { ThemeMode, SalaryMode } from '../types';

interface UIState {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  ratePromptSeen: boolean;
  countryCode: string;
  currencyCode: string;
  mode: SalaryMode;

  setTheme: (theme: ThemeMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setRatePromptSeen: (seen: boolean) => void;
  setCountryCode: (code: string) => void;
  setCurrencyCode: (code: string) => void;
  setMode: (mode: SalaryMode) => void;
  resetUI: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      notificationsEnabled: false,
      ratePromptSeen: false,
      countryCode: 'FR',
      currencyCode: 'EUR',
      mode: 'simple',

      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),
      setRatePromptSeen: (seen) => set({ ratePromptSeen: seen }),
      setCountryCode: (code) => set({ countryCode: code }),
      setCurrencyCode: (code) => set({ currencyCode: code }),
      setMode: (mode) => set({ mode }),
      resetUI: () =>
        set({
          theme: 'dark',
          notificationsEnabled: false,
          ratePromptSeen: false,
          countryCode: 'FR',
          currencyCode: 'EUR',
          mode: 'simple',
        }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
