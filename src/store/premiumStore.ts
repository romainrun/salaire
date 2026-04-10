import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './persist';

interface PremiumState {
  isPremium: boolean;
  adsUnlocked: boolean;
  trialUsed: boolean;

  unlockPremium: () => void;
  unlockAds: () => void;
  setPremium: (value: boolean) => void;
  consumeTrial: () => void;
  resetPremium: () => void;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      adsUnlocked: false,
      trialUsed: false,

      unlockPremium: () => set({ isPremium: true }),
      unlockAds: () => set({ adsUnlocked: true }),
      setPremium: (value) => set({ isPremium: value }),
      consumeTrial: () => set({ trialUsed: true }),
      resetPremium: () =>
        set({ isPremium: false, adsUnlocked: false, trialUsed: false }),
    }),
    {
      name: 'premium-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
