import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './persist';
import type { ThemeMode, SalaryMode } from '../types';

function getDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

interface UIState {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  ratePromptSeen: boolean;
  countryCode: string;
  currencyCode: string;
  mode: SalaryMode;
  actionCount: number;
  sessionAdCount: number;
  lastAdTimestamp: number | null;
  comparisonUsageCount: number;
  dailyAdCount: number;
  dailyAdDate: string;
  showTopHomeBanner: boolean;
  isUserTyping: boolean;

  setTheme: (theme: ThemeMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setRatePromptSeen: (seen: boolean) => void;
  setCountryCode: (code: string) => void;
  setCurrencyCode: (code: string) => void;
  setMode: (mode: SalaryMode) => void;
  incrementActionCount: () => void;
  registerInterstitialShown: () => void;
  incrementComparisonUsage: () => void;
  setShowTopHomeBanner: (value: boolean) => void;
  setIsUserTyping: (value: boolean) => void;
  resetComparisonUsage: () => void;
  startSession: () => void;
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
      actionCount: 0,
      sessionAdCount: 0,
      lastAdTimestamp: null,
      comparisonUsageCount: 0,
      dailyAdCount: 0,
      dailyAdDate: getDayKey(),
      showTopHomeBanner: false,
      isUserTyping: false,

      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),
      setRatePromptSeen: (seen) => set({ ratePromptSeen: seen }),
      setCountryCode: (code) => set({ countryCode: code }),
      setCurrencyCode: (code) => set({ currencyCode: code }),
      setMode: (mode) => set({ mode }),
      incrementActionCount: () =>
        set((state) => ({ actionCount: state.actionCount + 1 })),
      registerInterstitialShown: () =>
        set((state) => {
          const dayKey = getDayKey();
          const isSameDay = state.dailyAdDate === dayKey;
          const dailyAdCount = isSameDay ? state.dailyAdCount + 1 : 1;
          return {
            sessionAdCount: state.sessionAdCount + 1,
            dailyAdCount,
            dailyAdDate: dayKey,
            lastAdTimestamp: Date.now(),
          };
        }),
      incrementComparisonUsage: () =>
        set((state) => ({ comparisonUsageCount: state.comparisonUsageCount + 1 })),
      setShowTopHomeBanner: (value) => set({ showTopHomeBanner: value }),
      setIsUserTyping: (value) => set({ isUserTyping: value }),
      resetComparisonUsage: () => set({ comparisonUsageCount: 0 }),
      startSession: () =>
        set({
          actionCount: 0,
          sessionAdCount: 0,
          comparisonUsageCount: 0,
          showTopHomeBanner: false,
          isUserTyping: false,
        }),
      resetUI: () =>
        set({
          theme: 'dark',
          notificationsEnabled: false,
          ratePromptSeen: false,
          countryCode: 'FR',
          currencyCode: 'EUR',
          mode: 'simple',
          actionCount: 0,
          sessionAdCount: 0,
          lastAdTimestamp: null,
          comparisonUsageCount: 0,
          dailyAdCount: 0,
          dailyAdDate: getDayKey(),
          showTopHomeBanner: false,
          isUserTyping: false,
        }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
