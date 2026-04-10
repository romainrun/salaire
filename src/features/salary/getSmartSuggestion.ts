import { countries } from '../../data';
import { grossToNet } from '../../utils/salary';

export interface SmartSuggestion {
  countryCode: string;
  countryName: string;
  flag: string;
  netMonthly: number;
  difference: number;
}

const THRESHOLD = 100;
const COMPARISON_COUNTRIES = ['CH', 'LU', 'DE', 'GB', 'US', 'NL', 'BE', 'IE'];

export function getSmartSuggestion(
  currentNetMonthly: number,
  currentGrossMonthly: number,
  currentCountryCode: string,
): SmartSuggestion | null {
  if (currentGrossMonthly <= 0) return null;

  let best: SmartSuggestion | null = null;

  for (const code of COMPARISON_COUNTRIES) {
    if (code === currentCountryCode) continue;
    const c = countries.find((x) => x.code === code);
    if (!c) continue;

    const net = grossToNet(currentGrossMonthly, c.taxRate);
    const diff = net - currentNetMonthly;

    if (diff > THRESHOLD && (!best || diff > best.difference)) {
      best = {
        countryCode: c.code,
        countryName: c.name,
        flag: c.flag,
        netMonthly: net,
        difference: Math.round(diff),
      };
    }
  }

  return best;
}
