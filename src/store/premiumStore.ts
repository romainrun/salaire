import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './persist';

export type UnlockableFeature = 'history' | 'comparison' | 'advancedOptions' | 'multiCurrency';

interface PremiumState {
  isPremium: boolean;
  adFreeUntil: number | null;
  unlockedFeatures: Partial<Record<UnlockableFeature, number>>;
  unlockPremium: () => void;
  setPremium: (value: boolean) => void;
  setAdFreeForMinutes: (minutes: number) => void;
  clearAdFree: () => void;
  unlockFeatureForMinutes: (feature: UnlockableFeature, minutes: number) => void;
  clearFeatureUnlock: (feature: UnlockableFeature) => void;
  clearExpiredUnlocks: () => void;
  isAdFreeActive: () => boolean;
  isFeatureUnlocked: (feature: UnlockableFeature) => boolean;
  resetPremium: () => void;
}

function getNow() {
  return Date.now();
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      adFreeUntil: null,
      unlockedFeatures: {},

      unlockPremium: () => set({ isPremium: true }),
      setPremium: (value) => set({ isPremium: value }),
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
          const next: Partial<Record<UnlockableFeature, number>> = {};
          (Object.keys(state.unlockedFeatures) as UnlockableFeature[]).forEach((feature) => {
            const until = state.unlockedFeatures[feature];
            if (until && until > now) {
              next[feature] = until;
            }
          });
          return {
            unlockedFeatures: next,
            adFreeUntil: state.adFreeUntil && state.adFreeUntil > now ? state.adFreeUntil : null,
          };
        }),
      isAdFreeActive: (): boolean => {
        const { isPremium, adFreeUntil } = get();
        if (isPremium) return true;
        return !!adFreeUntil && adFreeUntil > getNow();
      },
      isFeatureUnlocked: (feature: UnlockableFeature): boolean => {
        const { isPremium, unlockedFeatures } = get();
        if (isPremium) return true;
        const until = unlockedFeatures[feature];
        return !!until && until > getNow();
      },
      resetPremium: () =>
        set({ isPremium: false, adFreeUntil: null, unlockedFeatures: {} as Partial<Record<UnlockableFeature, number>> }),
    }),
    {
      name: 'premium-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
