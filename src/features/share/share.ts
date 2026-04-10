import type { SalaryInputType, SalaryResults } from '../../types';
import { formatCurrency } from '../../utils/format';

export function generateShareText(
  inputType: SalaryInputType,
  inputValue: string,
  results: SalaryResults,
  symbol: string
): string {
  const lines = [
    '\ud83d\udcb0 Mon Salaire - Simulation',
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
    'Calcul\u00e9 avec l\u2019app Salaire',
  ];
  return lines.join('\n');
}
