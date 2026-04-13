import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './persist';

interface PremiumState {
  adFreeUntil: number | null;
  unlockedFeatures: Record<string, number>;
  setAdFreeForMinutes: (minutes: number) => void;
  clearAdFree: () => void;
  unlockFeatureForMinutes: (feature: string, minutes: number) => void;
  clearFeatureUnlock: (feature: string) => void;
  clearExpiredUnlocks: () => void;
  isAdFreeActive: () => boolean;
  isFeatureUnlocked: (feature: string) => boolean;
  resetUnlocks: () => void;
}

function getNow() {
  return Date.now();
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      adFreeUntil: null,
      unlockedFeatures: {},

      setAdFreeForMinutes: (minutes) =>
        set({
          adFreeUntil: getNow() + Math.max(1, minutes) * 60 * 1000,
        }),
      clearAdFree: () => set({ adFreeUntil: null }),
      unlockFeatureForMinutes: (feature, minutes) =>
        set((state) => ({
          unlockedFeatures: {
            ...state.unlockedFeatures,
            [feature]: getNow() + Math.max(1, minutes) * 60 * 1000,
          },
        })),
      clearFeatureUnlock: (feature) =>
        set((state) => {
          const next = { ...state.unlockedFeatures };
          delete next[feature];
          return { unlockedFeatures: next };
        }),
      clearExpiredUnlocks: () =>
        set((state) => {
          const now = getNow();
          const next = Object.fromEntries(
            Object.entries(state.unlockedFeatures).filter(([, until]) => !!until && until > now)
          ) as Record<string, number>;
          return {
            unlockedFeatures: next,
            adFreeUntil: state.adFreeUntil && state.adFreeUntil > now ? state.adFreeUntil : null,
          };
        }),
      isAdFreeActive: (): boolean => {
        const { adFreeUntil } = get();
        return !!adFreeUntil && adFreeUntil > getNow();
      },
      isFeatureUnlocked: (feature: string): boolean => {
        const { unlockedFeatures } = get();
        const until = unlockedFeatures[feature];
        return !!until && until > getNow();
      },
      resetUnlocks: () =>
        set({
          adFreeUntil: null,
          unlockedFeatures: {},
        }),
    }),
    {
      name: 'premium-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
