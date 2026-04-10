import { currencies } from '../data';

const rateMap = new Map(currencies.map((c) => [c.code, c.rateToEUR]));

export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to || amount === 0) return amount;
  const fromRate = rateMap.get(from);
  const toRate = rateMap.get(to);
  if (!fromRate || !toRate || toRate === 0) return amount;
  const inEUR = amount * fromRate;
  return Math.round((inEUR / toRate) * 100) / 100;
}

export function getCurrencySymbolByCode(code: string): string {
  const c = currencies.find((cur) => cur.code === code);
  return c?.symbol ?? code;
}
