import { useSalaryStore } from '../../store/salaryStore';
import type { SimulationHistoryItem } from '../../types';

export function getHistory(): SimulationHistoryItem[] {
  return useSalaryStore.getState().history;
}

export function clearAllHistory(): void {
  useSalaryStore.getState().clearHistory();
}

export function saveCurrentSimulation(title: string): void {
  useSalaryStore.getState().saveSimulation(title);
}
