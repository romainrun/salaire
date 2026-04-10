import type { SalaryResults, SalaryInputType } from '../../types';
import { formatCurrency } from '../../utils/format';
import { APP_NAME, LABELS } from '../../constants/appName';

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
    `💰 ${LABELS.result} — ${APP_NAME}`,
  ];

  if (countryFlag && countryName) {
    lines.push(`${countryFlag} ${countryName}`);
  }

  lines.push('');
  lines.push(`📊 ${LABELS.grossMonthly} : ${formatCurrency(results.grossMonthly, symbol)}`);
  lines.push(`💵 ${LABELS.netMonthly} : ${formatCurrency(results.netMonthly, symbol)}`);
  lines.push('');
  lines.push(`📅 ${LABELS.yearlyFull} : ${formatCurrency(results.grossYearly, symbol)} brut → ${formatCurrency(results.netYearly, symbol)} net`);
  lines.push(`📅 ${LABELS.dailyFull} : ${formatCurrency(results.grossDaily, symbol)} brut → ${formatCurrency(results.netDaily, symbol)} net`);
  lines.push('');
  lines.push(`🚀 ${LABELS.generatedWith}`);

  return lines.join('\n');
}
