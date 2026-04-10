import { usePremiumStore } from '../../store/premiumStore';

export function checkPremiumAccess(): boolean {
  const { isPremium, adsUnlocked } = usePremiumStore.getState();
  return isPremium || adsUnlocked;
}

export function simulateAdWatch(): void {
  usePremiumStore.getState().unlockAds();
}

export function simulatePurchase(): void {
  usePremiumStore.getState().unlockPremium();
}
