import type { SalaryResults, SalaryInputType, SalaryPeriod } from '../types';

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

export function dailyFromMonthly(monthly: number, workDaysPerMonth = 21.67): number {
  if (workDaysPerMonth === 0) return 0;
  return roundCurrency(monthly / workDaysPerMonth);
}

export function monthlyFromDaily(daily: number, workDaysPerMonth = 21.67): number {
  return roundCurrency(daily * workDaysPerMonth);
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
  period: SalaryPeriod,
  options: RecalculateOptions
): SalaryResults {
  const { taxRate, pasEnabled, pasRate, monthsPerYear = 12 } = options;

  if (value <= 0 || isNaN(value)) return emptyResults();

  let grossMonthly: number;
  let netMonthly: number;

  if (period === 'monthly') {
    if (inputType === 'gross') {
      grossMonthly = roundCurrency(value);
      netMonthly = grossToNet(grossMonthly, taxRate);
    } else {
      netMonthly = roundCurrency(value);
      grossMonthly = netToGross(netMonthly, taxRate);
    }
  } else if (period === 'yearly') {
    const monthly = yearlyToMonthly(value, monthsPerYear);
    if (inputType === 'gross') {
      grossMonthly = monthly;
      netMonthly = grossToNet(grossMonthly, taxRate);
    } else {
      netMonthly = monthly;
      grossMonthly = netToGross(netMonthly, taxRate);
    }
  } else {
    const monthly = monthlyFromDaily(value);
    if (inputType === 'gross') {
      grossMonthly = monthly;
      netMonthly = grossToNet(grossMonthly, taxRate);
    } else {
      netMonthly = monthly;
      grossMonthly = netToGross(netMonthly, taxRate);
    }
  }

  if (pasEnabled && pasRate > 0) {
    netMonthly = applyPAS(netMonthly, pasRate);
  }

  const grossYearly = monthlyToYearly(grossMonthly, monthsPerYear);
  const netYearly = monthlyToYearly(netMonthly, monthsPerYear);
  const grossDaily = dailyFromMonthly(grossMonthly);
  const netDaily = dailyFromMonthly(netMonthly);

  return { grossMonthly, netMonthly, grossYearly, netYearly, grossDaily, netDaily };
}

export function recalculateFromField(
  value: number,
  field: keyof SalaryResults,
  options: RecalculateOptions
): SalaryResults {
  const isGross = field.startsWith('gross');
  const inputType: SalaryInputType = isGross ? 'gross' : 'net';

  let period: SalaryPeriod;
  if (field.includes('Monthly')) period = 'monthly';
  else if (field.includes('Yearly')) period = 'yearly';
  else period = 'daily';

  return recalculateFromInput(value, inputType, period, options);
}
