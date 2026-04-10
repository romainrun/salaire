import type { SalaryInputType, SalaryResults } from '../../types';
import { formatCurrency } from '../../utils/format';

export function generateShareText(
  inputType: SalaryInputType,
  inputValue: string,
  results: SalaryResults,
  symbol: string
): string {
  const lines = [
    '💰 Mon Salaire - Simulation',
    '',
    `Saisie : ${inputValue} ${symbol} (${inputType === 'gross' ? 'brut' : 'net'})`,
    '',
    `Brut mensuel : ${formatCurrency(results.grossMonthly, symbol)}`,
    `Net mensuel : ${formatCurrency(results.netMonthly, symbol)}`,
    '',
    `Brut annuel : ${formatCurrency(results.grossYearly, symbol)}`,
    `Net annuel : ${formatCurrency(results.netYearly, symbol)}`,
    '',
    `Brut journalier : ${formatCurrency(results.grossDaily, symbol)}`,
    `Net journalier : ${formatCurrency(results.netDaily, symbol)}`,
    '',
    'Calculé avec l\'app Salaire',
  ];
  return lines.join('\n');
}
