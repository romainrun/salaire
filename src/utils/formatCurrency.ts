const MAX_SAFE = 999_999_999;

const frFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatterMap: Record<string, Intl.NumberFormat> = {
  'fr-FR': frFormatter,
  'en-US': usFormatter,
};

function getFormatter(locale: string): Intl.NumberFormat {
  if (formatterMap[locale]) return formatterMap[locale];
  try {
    const f = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    formatterMap[locale] = f;
    return f;
  } catch {
    return frFormatter;
  }
}

export function formatAmount(value: number, symbol = '€', locale = 'fr-FR'): string {
  const safe = clampValue(value);
  return `${getFormatter(locale).format(safe)} ${symbol}`;
}

export function formatCompact(value: number, symbol = '€'): string {
  const safe = clampValue(value);
  if (Math.abs(safe) >= 1_000_000) return `${(safe / 1_000_000).toFixed(1)}M ${symbol}`;
  if (Math.abs(safe) >= 10_000) return `${(safe / 1_000).toFixed(1)}k ${symbol}`;
  return formatAmount(safe, symbol);
}

export function clampValue(value: number): number {
  if (!isFinite(value) || isNaN(value)) return 0;
  return Math.max(-MAX_SAFE, Math.min(MAX_SAFE, value));
}
