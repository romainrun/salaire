import { useUIStore } from '../../store/uiStore';

export function shouldShowRatePrompt(): boolean {
  return !useUIStore.getState().ratePromptSeen;
}

export function markRatePromptSeen(): void {
  useUIStore.getState().setRatePromptSeen(true);
}
