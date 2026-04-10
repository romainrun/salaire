import type { SalaryResults, SalaryInputType } from '../../types';
import { formatAmount } from '../../utils/formatCurrency';
import { APP_NAME } from '../../constants/appName';

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
    `💰 Je gagne ${formatAmount(results.netMonthly, symbol)} net/mois`,
    '',
    `📊 Brut : ${formatAmount(results.grossMonthly, symbol)}`,
  ];

  if (countryFlag && countryName) {
    lines.push(`${countryFlag} ${countryName}`);
  }

  lines.push('');
  lines.push(`📅 ${formatAmount(results.netYearly, symbol)} net/an`);
  lines.push('');
  lines.push(`⚡ ${APP_NAME}`);

  return lines.join('\n');
}
