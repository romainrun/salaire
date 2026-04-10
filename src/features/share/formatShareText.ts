import type { SalaryResults, SalaryInputType } from '../../types';
import { formatCurrency } from '../../utils/format';

export function formatShareText(options: {
  inputType: SalaryInputType;
  inputValue: string;
  results: SalaryResults;
  symbol: string;
  countryName?: string;
  countryFlag?: string;
}): string {
  const { results, symbol, countryName, countryFlag } = options;
  const lines: string[] = [
    '💰 Simulation Salaire',
  ];

  if (countryFlag && countryName) {
    lines.push(`${countryFlag} ${countryName}`);
  }

  lines.push('');
  lines.push(`📊 Brut mensuel : ${formatCurrency(results.grossMonthly, symbol)}`);
  lines.push(`💵 Net mensuel : ${formatCurrency(results.netMonthly, symbol)}`);
  lines.push('');
  lines.push('📅 Détails');
  lines.push(`  Annuel : ${formatCurrency(results.grossYearly, symbol)} brut → ${formatCurrency(results.netYearly, symbol)} net`);
  lines.push(`  Journalier : ${formatCurrency(results.grossDaily, symbol)} brut → ${formatCurrency(results.netDaily, symbol)} net`);
  lines.push('');
  lines.push('🚀 Calculé avec l\'app Salaire');

  return lines.join('\n');
}
