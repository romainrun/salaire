import { useCallback, useMemo } from 'react';
import { useSalaryStore } from '../../store/salaryStore';
import type { SimulationHistoryItem } from '../../types';

export type SortMode = 'date' | 'amount';

export function useHistory(sortMode: SortMode = 'date') {
  const history = useSalaryStore((s) => s.history);
  const deleteItem = useSalaryStore((s) => s.deleteHistoryItem);
  const renameItem = useSalaryStore((s) => s.renameHistoryItem);
  const loadItem = useSalaryStore((s) => s.loadSimulation);
  const toggleFav = useSalaryStore((s) => s.toggleFavorite);
  const clearAll = useSalaryStore((s) => s.clearHistory);

  const sorted = useMemo(() => {
    const items = [...history];
    if (sortMode === 'amount') {
      items.sort((a, b) => b.results.netMonthly - a.results.netMonthly);
    }
    return items;
  }, [history, sortMode]);

  const favorites = useMemo(() => sorted.filter((h) => h.favorite), [sorted]);

  const remove = useCallback((id: string) => { deleteItem(id); }, [deleteItem]);
  const rename = useCallback((id: string, title: string) => { renameItem(id, title); }, [renameItem]);
  const load = useCallback((item: SimulationHistoryItem) => { loadItem(item); }, [loadItem]);
  const toggleFavorite = useCallback((id: string) => { toggleFav(id); }, [toggleFav]);

  return { items: sorted, favorites, remove, rename, load, toggleFavorite, clearAll };
}
