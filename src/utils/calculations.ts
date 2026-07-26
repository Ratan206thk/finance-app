/**
 * Calculation Utilities
 */

import { AppState } from '../types';

export function calcRSUTotalNet(state: AppState): number {
  const price = state.in_sharePrice;
  const fx = state.in_usdInr;
  const taxRate = state.in_vestTaxRate / 100;

  return state.rsuRows.reduce((sum, row) => {
    const gross = row.shares * price * fx + row.cash;
    const net = gross * (1 - taxRate);
    return sum + net;
  }, 0);
}

export function calcSIPTotals(state: AppState) {
  let totalSip = 0;
  let totalVal = 0;
  const catTotals: Record<string, number> = {};

  state.sipRows.forEach((row) => {
    totalSip += row.sip;
    totalVal += row.val;
    catTotals[row.cat] = (catTotals[row.cat] || 0) + row.sip;
  });

  return { totalSip, totalVal, catTotals };
}

export function calcCashTotals(state: AppState) {
  const peg = state.in_npr_peg || 1.6;
  let icTotal = 0;
  let ncTotalNpr = 0;

  state.accountsRows.forEach((row) => {
    if (row.currency === 'NPR') {
      ncTotalNpr += row.amount;
    } else {
      icTotal += row.amount;
    }
  });

  const ncInInr = ncTotalNpr / peg;
  const total = icTotal + ncInInr;

  return { icTotal, ncTotalNpr, ncInInr, total };
}

export function calcLedgerTotals(state: AppState) {
  let totalEarn = 0;
  let totalExp = 0;
  let totalSave = 0;

  state.ledgerRows.forEach((row) => {
    const totalIncome = row.earning + row.bonus;
    const totalExpense =
      row.personalExp + Math.max(0, row.familyExp) + row.investRent + row.pfNpsEtc;
    totalEarn += totalIncome;
    totalExp += totalExpense;
    totalSave += row.saving;
  });

  const n = state.ledgerRows.length || 1;
  return {
    avgEarn: totalEarn / n,
    avgExp: totalExp / n,
    avgSave: totalSave / n,
  };
}

export function calcLendenTotals(state: AppState) {
  let owedToYou = 0;
  let owedByYou = 0;

  state.lendenRows.forEach((row) => {
    if (row.amount >= 0) {
      owedToYou += row.amount;
    } else {
      owedByYou += row.amount;
    }
  });

  return {
    owedToYou,
    owedByYou,
    netPosition: owedToYou + owedByYou,
  };
}

export function calcInsuranceTotals(state: AppState) {
  let sumAssured = 0;
  let premium = 0;

  state.insuranceRows.forEach((row) => {
    sumAssured += row.sumAssured;
    premium += row.premium;
  });

  return { sumAssured, premium };
}

export function calcNetWorth(state: AppState) {
  const { total: cashTotal } = calcCashTotals(state);
  const { totalVal: mfValue } = calcSIPTotals(state);
  const rsuVested = calcRSUTotalNet(state);
  const pfNps = state.in_pfNpsBalance;

  return cashTotal + mfValue + rsuVested + pfNps;
}

export function calcHouseLoan(state: AppState, monthlyInHand: number) {
  const emiPct = state.in_emiPct / 100;
  const emi = monthlyInHand * emiPct;
  const rate = (state.in_loanRate / 100) / 12;
  const n = state.in_loanTenure * 12;
  const loanEligible = (emi * (1 - Math.pow(1 + rate, -n))) / rate;
  const downPct = state.in_downPct / 100;
  const propertyBudget = loanEligible / (1 - downPct);
  const downPayment = propertyBudget * downPct;

  return { emi, loanEligible, propertyBudget, downPayment };
}

export function calcProjection(
  state: AppState,
  cashTotal: number,
  mfValue: number,
  pfNps: number,
  rsuVested: number,
  rsuPipelineFuture: number
) {
  const eqReturn = state.in_equityReturn / 100;
  const pfReturn = state.in_pfReturn / 100;
  const years = state.in_years;
  const { totalSip } = calcSIPTotals(state);

  const labels = ['Today'];
  const mfSeries = [mfValue];
  const pfSeries = [pfNps];
  const cashSeries = [cashTotal];

  for (let y = 1; y <= years; y++) {
    labels.push(`Year ${y}`);
    const months = y * 12;
    const monthlyReturn = Math.pow(1 + eqReturn, 1 / 12) - 1;
    const fvSip =
      totalSip *
      ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) *
      (1 + monthlyReturn);
    mfSeries.push(mfValue * Math.pow(1 + eqReturn, y) + fvSip);
    pfSeries.push(pfNps * Math.pow(1 + pfReturn, y));
    cashSeries.push(cashTotal);
  }

  const totalSeries = labels.map((_, i) =>
    mfSeries[i] +
    pfSeries[i] +
    cashSeries[i] +
    rsuVested +
    (i > 0 ? (rsuPipelineFuture * Math.min(i / years, 1)) : 0)
  );

  return {
    labels,
    mfSeries,
    pfSeries,
    cashSeries,
    totalSeries,
  };
}
