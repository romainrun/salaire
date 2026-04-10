export function parseInputAmount(text: string): number {
  const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

export function formatCurrency(value: number, symbol = '\u20ac'): string {
  return `${value.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${symbol}`;
}

export function formatMoney(value: number, symbol = '\u20ac'): string {
  return formatCurrency(value, symbol);
}

export function formatCompactCurrency(value: number, symbol = '\u20ac'): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M ${symbol}`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k ${symbol}`;
  }
  return formatCurrency(value, symbol);
}

export function toDisplayNumber(value: number): string {
  if (value === 0) return '';
  return value.toFixed(2).replace(/\.00$/, '');
}
