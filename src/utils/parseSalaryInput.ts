const MULTIPLIERS: Record<string, number> = {
  k: 1_000,
  K: 1_000,
  m: 1_000_000,
  M: 1_000_000,
};

export function parseSalaryInput(text: string): number {
  if (!text || !text.trim()) return 0;
  const trimmed = text.trim().replace(/\s/g, '').replace(',', '.');
  const lastChar = trimmed[trimmed.length - 1];
  const multiplier = MULTIPLIERS[lastChar];

  if (multiplier) {
    const numPart = trimmed.slice(0, -1);
    const val = parseFloat(numPart);
    return isNaN(val) ? 0 : val * multiplier;
  }

  const val = parseFloat(trimmed.replace(/[^0-9.]/g, ''));
  return isNaN(val) ? 0 : val;
}
