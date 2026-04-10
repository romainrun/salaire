import { formatAmount, formatCompact } from './formatCurrency';

export function parseInputAmount(text: string): number {
  const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
  const value = parseFloat(cleaned);
  return isNaN(value) || !isFinite(value) ? 0 : Math.max(0, value);
}

export function formatCurrency(value: number, symbol = '€'): string {
  return formatAmount(value, symbol);
}

export function formatMoney(value: number, symbol = '€'): string {
  return formatAmount(value, symbol);
}

export function formatCompactCurrency(value: number, symbol = '€'): string {
  return formatCompact(value, symbol);
}

export function toDisplayNumber(value: number): string {
  if (value === 0) return '';
  return value.toFixed(2).replace(/\.00$/, '');
}
