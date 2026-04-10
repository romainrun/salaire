import type { SalaryResults, SalaryInputType } from '../types';

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function emptyResults(): SalaryResults {
  return {
    grossMonthly: 0,
    netMonthly: 0,
    grossYearly: 0,
    netYearly: 0,
    grossDaily: 0,
    netDaily: 0,
  };
}

export function grossToNet(gross: number, taxRate: number): number {
  return roundCurrency(gross * (1 - taxRate));
}

export function netToGross(net: number, taxRate: number): number {
  if (taxRate >= 1) return 0;
  return roundCurrency(net / (1 - taxRate));
}

export function monthlyToYearly(monthly: number, monthsPerYear = 12): number {
  return roundCurrency(monthly * monthsPerYear);
}

export function yearlyToMonthly(yearly: number, monthsPerYear = 12): number {
  if (monthsPerYear === 0) return 0;
  return roundCurrency(yearly / monthsPerYear);
}

export function dailyFromYearly(yearly: number, workDays = 260): number {
  if (workDays === 0) return 0;
  return roundCurrency(yearly / workDays);
}

export function applyPAS(net: number, pasRate: number): number {
  return roundCurrency(net * (1 - pasRate / 100));
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

interface RecalculateOptions {
  taxRate: number;
  pasEnabled: boolean;
  pasRate: number;
  monthsPerYear?: number;
}

export function recalculateFromInput(
  value: number,
  inputType: SalaryInputType,
  options: RecalculateOptions
): SalaryResults {
  const { taxRate, pasEnabled, pasRate, monthsPerYear = 12 } = options;

  if (value <= 0 || isNaN(value)) return emptyResults();

  let grossMonthly: number;
  let netMonthly: number;

  if (inputType === 'gross') {
    grossMonthly = roundCurrency(value);
    netMonthly = grossToNet(grossMonthly, taxRate);
  } else {
    netMonthly = roundCurrency(value);
    grossMonthly = netToGross(netMonthly, taxRate);
  }

  if (pasEnabled && pasRate > 0) {
    netMonthly = applyPAS(netMonthly, pasRate);
  }

  const grossYearly = monthlyToYearly(grossMonthly, monthsPerYear);
  const netYearly = monthlyToYearly(netMonthly, monthsPerYear);
  const grossDaily = dailyFromYearly(grossYearly);
  const netDaily = dailyFromYearly(netYearly);

  return {
    grossMonthly,
    netMonthly,
    grossYearly,
    netYearly,
    grossDaily,
    netDaily,
  };
}
