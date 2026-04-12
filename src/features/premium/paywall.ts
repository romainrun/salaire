import { useUIStore } from '../../store/uiStore';

export type PaywallReason = 'first-session' | 'feature-lock' | 'manual';

export function openPaywall(reason: PaywallReason): void {
  const ui = useUIStore.getState();
  ui.setPaywallState({ visible: true, reason });
}

export function closePaywall(): void {
  useUIStore.getState().setPaywallState({ visible: false });
}
