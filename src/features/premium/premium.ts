import { usePremiumStore } from '../../store/premiumStore';

export function checkPremiumAccess(): boolean {
  const { isPremium, adsUnlocked } = usePremiumStore.getState();
  return isPremium || adsUnlocked;
}
