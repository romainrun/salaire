import { useEffect } from 'react';
import { useOnboardingStore } from '../store/onboardingStore';
import { useSalaryStore } from '../store/salaryStore';
import { useUIStore } from '../store/uiStore';
import { getCountryByCode } from '../data';

export function useSalaryRealtimeSync() {
  const country = useOnboardingStore((s) => s.country);
  const currency = useOnboardingStore((s) => s.currency);
  const pasEnabled = useOnboardingStore((s) => s.pasEnabled);
  const pasRate = useOnboardingStore((s) => s.pasRate);
  const workHoursPerWeek = useOnboardingStore((s) => s.workHoursPerWeek);
  const monthsPerYear = useOnboardingStore((s) => s.monthsPerYear);

  useEffect(() => {
    useUIStore.getState().setCountryCode(country);
    useUIStore.getState().setCurrencyCode(currency);
  }, [country, currency]);

  useEffect(() => {
    const countryData = getCountryByCode(country);
    const taxRate = countryData?.taxRate ?? 0.23;

    useSalaryStore.getState().recomputeFromSettings({
      taxRate,
      pasEnabled,
      pasRate,
      monthsPerYear,
    });
  }, [country, pasEnabled, pasRate, workHoursPerWeek, monthsPerYear]);
}
