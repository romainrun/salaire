const MAX_SALARY = 99_999_999;
const MULTIPLIERS: Record<string, number> = { k: 1_000, K: 1_000, m: 1_000_000, M: 1_000_000 };

export function parseSalaryInput(text: string): number {
  if (!text || !text.trim()) return 0;
  const trimmed = text.trim().replace(/\s/g, '').replace(',', '.');
  const lastChar = trimmed[trimmed.length - 1];
  const multiplier = MULTIPLIERS[lastChar];

  let val: number;
  if (multiplier) {
    val = parseFloat(trimmed.slice(0, -1));
    if (isNaN(val) || !isFinite(val)) return 0;
    val *= multiplier;
  } else {
    val = parseFloat(trimmed.replace(/[^0-9.\-]/g, ''));
    if (isNaN(val) || !isFinite(val)) return 0;
  }

  if (val < 0) return 0;
  return Math.min(val, MAX_SALARY);
}
