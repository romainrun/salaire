import { roundCurrency } from '../../utils/salary';

export interface SalaryBreakdown {
  grossMonthly: number;
  charges: number;
  chargesPercent: number;
  netBeforeTax: number;
  pas: number;
  pasPercent: number;
  netFinal: number;
  bonus: number;
  thirteenthMonth: number;
}

export function computeBreakdown(options: {
  grossMonthly: number;
  taxRate: number;
  pasEnabled: boolean;
  pasRate: number;
  bonus?: number;
  thirteenthMonth?: boolean;
}): SalaryBreakdown {
  const { grossMonthly, taxRate, pasEnabled, pasRate, bonus = 0, thirteenthMonth = false } = options;

  const thirteenthValue = thirteenthMonth ? roundCurrency(grossMonthly / 12) : 0;
  const effectiveGross = roundCurrency(grossMonthly + thirteenthValue + bonus);

  const charges = roundCurrency(effectiveGross * taxRate);
  const netBeforeTax = roundCurrency(effectiveGross - charges);

  const pasAmount = pasEnabled ? roundCurrency(netBeforeTax * (pasRate / 100)) : 0;
  const netFinal = roundCurrency(netBeforeTax - pasAmount);

  return {
    grossMonthly: effectiveGross,
    charges,
    chargesPercent: taxRate * 100,
    netBeforeTax,
    pas: pasAmount,
    pasPercent: pasEnabled ? pasRate : 0,
    netFinal,
    bonus,
    thirteenthMonth: thirteenthValue,
  };
}
