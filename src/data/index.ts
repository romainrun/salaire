import type { Country, CurrencyRate } from '../types';
import countriesData from './countries.json';
import currenciesData from './currencies.json';

export const countries: Country[] = countriesData as Country[];
export const currencies: CurrencyRate[] = currenciesData as CurrencyRate[];

export const countryMap = new Map<string, Country>(
  countries.map((c) => [c.code, c])
);

export const currencyMap = new Map<string, CurrencyRate>(
  currencies.map((c) => [c.code, c])
);

export const defaultCountry: Country = countryMap.get('FR')!;
export const defaultCurrency: CurrencyRate = currencyMap.get('EUR')!;

export function getCountryByCode(code: string): Country | undefined {
  return countryMap.get(code);
}

export function getCurrencyByCode(code: string): CurrencyRate | undefined {
  return currencyMap.get(code);
}

export function getCurrencySymbol(currencyCode: string): string {
  return currencyMap.get(currencyCode)?.symbol ?? currencyCode;
}
