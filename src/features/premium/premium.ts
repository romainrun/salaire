import { usePremiumStore } from '../../store/premiumStore';

export function checkPremiumAccess(): boolean {
  return usePremiumStore.getState().isAdFreeActive();
}
