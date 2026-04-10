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

const EU_COUNTRIES = new Set(['FR', 'BE', 'LU', 'DE', 'ES', 'IT', 'PT', 'NL', 'AT', 'IE']);
const NON_EU_RICH = new Set(['CH', 'GB', 'US', 'CA']);

function getRelevantCountries(currentCode: string): string[] {
  if (EU_COUNTRIES.has(currentCode)) {
    return [...EU_COUNTRIES, 'CH', 'GB'].filter((c) => c !== currentCode);
  }
  if (currentCode === 'CH' || currentCode === 'GB') {
    return [...EU_COUNTRIES, ...NON_EU_RICH].filter((c) => c !== currentCode);
  }
  return [...EU_COUNTRIES, ...NON_EU_RICH].filter((c) => c !== currentCode);
}

export function getSmartSuggestion(
  currentNetMonthly: number,
  currentGrossMonthly: number,
  currentCountryCode: string,
): SmartSuggestion | null {
  if (currentGrossMonthly <= 0) return null;

  const relevantCodes = getRelevantCountries(currentCountryCode);
  let best: SmartSuggestion | null = null;

  for (const code of relevantCodes) {
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
