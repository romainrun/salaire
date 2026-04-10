export type UseCase = 'convert' | 'target';
export type SalaryInputType = 'gross' | 'net';
export type SalaryMode = 'simple' | 'advanced';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface Country {
  code: string;
  name: string;
  currency: string;
  taxRate: number;
  flag: string;
}

export interface CurrencyRate {
  code: string;
  symbol: string;
  rateToEUR: number;
}

export interface SalaryResults {
  grossMonthly: number;
  netMonthly: number;
  grossYearly: number;
  netYearly: number;
  grossDaily: number;
  netDaily: number;
}

export interface SimulationHistoryItem {
  id: string;
  title: string;
  createdAt: string;
  inputType: SalaryInputType;
  inputValue: number;
  taxRate: number;
  pasEnabled: boolean;
  pasRate: number;
  results: SalaryResults;
}
