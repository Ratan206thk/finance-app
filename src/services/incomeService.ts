/**
 * Income Service
 * Handles all tax calculations (Indian New Tax Regime FY 2026-27)
 */

export interface TaxCalculation {
  basic: number;
  erPf: number;
  erNps: number;
  bonus: number;
  equityIncome: number;
  totalSalaryIncome: number;
  taxableIncome: number;
  taxPreCess: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
  marginalSlab: string;
  inHand: number;
}

/**
 * Calculate income tax using Indian New Regime slabs (FY 2026-27)
 * Slabs: 0-4L (0%), 4-8L (5%), 8-12L (10%), 12-16L (15%), 16-20L (20%), 20-24L (25%), 24L+ (30%)
 */
function calcTax(income: number): number {
  const slabs = [
    [400000, 0],
    [800000, 0.05],
    [1200000, 0.1],
    [1600000, 0.15],
    [2000000, 0.2],
    [2400000, 0.25],
    [Infinity, 0.3],
  ] as const;

  let tax = 0;
  let prev = 0;

  for (const [limit, rate] of slabs) {
    if (income > limit) {
      tax += (limit - prev) * rate;
      prev = limit;
    } else {
      tax += (income - prev) * rate;
      break;
    }
  }

  return tax;
}

export function calculateIncome(
  ctc: number,
  basicPct: number,
  bonusPct: number,
  empPfPct: number,
  erPfPct: number,
  erNpsPct: number,
  stdDed: number,
  rsuThisFy: number,
  cashAwardThisFy: number,
  espp: number
): TaxCalculation {
  const basic = ctc * (basicPct / 100);
  const erPf = basic * (erPfPct / 100);
  const erNps = basic * (erNpsPct / 100);
  const bonus = ctc * (bonusPct / 100);
  const equityIncome = rsuThisFy + cashAwardThisFy + espp;

  const totalSalaryIncome = ctc - erPf - erNps + bonus + equityIncome;
  const taxableIncome = totalSalaryIncome - stdDed;
  const taxPreCess = calcTax(Math.max(0, taxableIncome));
  const cess = taxPreCess * 0.04;
  const totalTax = taxPreCess + cess;
  const empPf = basic * (empPfPct / 100);
  const inHand = ctc + bonus + equityIncome - empPf - erPf - erNps - totalTax;

  let marginalSlab = '30%';
  if (taxableIncome <= 400000) marginalSlab = '0%';
  else if (taxableIncome <= 800000) marginalSlab = '5%';
  else if (taxableIncome <= 1200000) marginalSlab = '10%';
  else if (taxableIncome <= 1600000) marginalSlab = '15%';
  else if (taxableIncome <= 2000000) marginalSlab = '20%';
  else if (taxableIncome <= 2400000) marginalSlab = '25%';

  const effectiveRate =
    totalSalaryIncome > 0 ? (totalTax / totalSalaryIncome) * 100 : 0;

  return {
    basic,
    erPf,
    erNps,
    bonus,
    equityIncome,
    totalSalaryIncome,
    taxableIncome,
    taxPreCess,
    cess,
    totalTax,
    effectiveRate,
    marginalSlab,
    inHand,
  };
}
