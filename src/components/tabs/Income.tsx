import React, { useState, useMemo } from 'react';
import { useAppState } from '../../store/Store';
import { evalExpr } from '../../services/expressionEvaluator';

export default function Income() {
  const { state, updateField } = useAppState();
  const [editingField, setEditingField] = useState<string | null>(null);

  // Tax calculation for India FY 2026-27 (New Regime)
  const calculateTax = (income: number): { tax: number; cess: number; total: number; rate: number } => {
    let tax = 0;
    let slab = '';

    if (income <= 400000) {
      tax = 0;
    } else if (income <= 800000) {
      tax = (income - 400000) * 0.05;
    } else if (income <= 1200000) {
      tax = 20000 + (income - 800000) * 0.1;
    } else if (income <= 1600000) {
      tax = 60000 + (income - 1200000) * 0.15;
    } else if (income <= 2000000) {
      tax = 120000 + (income - 1600000) * 0.2;
    } else if (income <= 2400000) {
      tax = 200000 + (income - 2000000) * 0.25;
    } else {
      tax = 300000 + (income - 2400000) * 0.3;
    }

    const cess = tax * 0.04;
    const total = tax + cess;
    const rate = income > 0 ? (total / income) * 100 : 0;

    return { tax, cess, total, rate };
  };

  // Calculate components
  const calculations = useMemo(() => {
    const ctc = typeof state.in_ctc === 'number' ? state.in_ctc : 0;
    const basicPct = typeof state.in_basicPct === 'number' ? state.in_basicPct : 50;
    const bonusPct = typeof state.in_bonusPct === 'number' ? state.in_bonusPct : 0;
    const erPfPct = typeof state.in_erPfPct === 'number' ? state.in_erPfPct : 0;
    const erNpsPct = typeof state.in_erNpsPct === 'number' ? state.in_erNpsPct : 0;
    const empPfPct = typeof state.in_empPfPct === 'number' ? state.in_empPfPct : 0;

    const basic = ctc * (basicPct / 100);
    const bonus = ctc * (bonusPct / 100);
    const erPf = ctc * (erPfPct / 100);
    const erNps = ctc * (erNpsPct / 100);
    const empPf = ctc * (empPfPct / 100);

    const grossSalary = basic + bonus + erPf + erNps;
    const deductions = empPf;
    const ctcAfterDed = grossSalary - deductions;

    const rsuShares = typeof state.in_rsuThisFy === 'number' ? state.in_rsuThisFy : 0;
    const sharePrice = typeof state.in_sharePrice === 'number' ? state.in_sharePrice : 0;
    const usdInr = typeof state.in_usdInr === 'number' ? state.in_usdInr : 0;
    const vestTaxRate = typeof state.in_vestTaxRate === 'number' ? state.in_vestTaxRate : 0;

    const rsuValue = rsuShares * sharePrice * usdInr;
    const rsuTax = rsuValue * (vestTaxRate / 100);
    const rsuAfterTax = rsuValue - rsuTax;

    const stdDed = typeof state.in_stdDed === 'number' ? state.in_stdDed : 0;
    const totalTaxableIncome = ctcAfterDed + rsuValue - stdDed;
    const { total: incomeTax, rate: taxRate } = calculateTax(totalTaxableIncome);

    const inHand = ctcAfterDed - incomeTax;

    return {
      ctc,
      basic,
      bonus,
      erPf,
      erNps,
      empPf,
      grossSalary,
      deductions,
      ctcAfterDed,
      rsuValue,
      rsuTax,
      rsuAfterTax,
      totalTaxableIncome,
      incomeTax,
      taxRate,
      inHand,
      cashAward: typeof state.in_cashAwardThisFy === 'number' ? state.in_cashAwardThisFy : 0,
      espp: typeof state.in_espp === 'number' ? state.in_espp : 0,
    };
  }, [state]);

  const handleEdit = (field: string, value: string) => {
    const key = field as keyof typeof state;
    const numValue = evalExpr(value);
    if (key.startsWith('in_')) {
      updateField(key, numValue);
    }
  };

  const EditableNumber = ({
    label,
    field,
    value,
    suffix = '',
  }: {
    label: string;
    field: string;
    value: number | undefined;
    suffix?: string;
  }) => {
    const displayValue = typeof value === 'number' ? value : 0;
    return (
      <div className="input-row">
        <label>{label}</label>
        {editingField === field ? (
          <input
            autoFocus
            type="text"
            defaultValue={displayValue}
            onChange={(e) => {
              handleEdit(field, e.target.value);
            }}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setEditingField(null);
            }}
          />
        ) : (
          <div
            className="editable-field"
            onClick={() => setEditingField(field)}
          >
            <span>{displayValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            <span className="suffix">{suffix}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="income" className="active" className="active">
      <h2 className="title">Income & Tax</h2>
      <p className="subtitle">
        Indian new tax regime, FY 2026-27 slabs. Edit any field — tax recalculates
        live.
      </p>

      {/* CTC & Components */}
      <div className="card">
        <h3>Salary Structure</h3>

        <EditableNumber
          label="CTC"
          field="in_ctc"
          value={state.in_ctc}
          suffix="₹"
        />

        <EditableNumber
          label="Basic %"
          field="in_basicPct"
          value={state.in_basicPct}
          suffix="%"
        />
        <div className="note">Basic: ₹{calculations.basic.toLocaleString('en-IN')}</div>

        <EditableNumber
          label="Bonus %"
          field="in_bonusPct"
          value={state.in_bonusPct}
          suffix="%"
        />
        <div className="note">Bonus: ₹{calculations.bonus.toLocaleString('en-IN')}</div>

        <EditableNumber
          label="Employer PF %"
          field="in_erPfPct"
          value={state.in_erPfPct}
          suffix="%"
        />

        <EditableNumber
          label="Employer NPS %"
          field="in_erNpsPct"
          value={state.in_erNpsPct}
          suffix="%"
        />

        <EditableNumber
          label="Employee PF %"
          field="in_empPfPct"
          value={state.in_empPfPct}
          suffix="%"
        />

        <div className="summary-box">
          <div>Gross Salary: ₹{calculations.grossSalary.toLocaleString('en-IN')}</div>
          <div>Deductions (PF): ₹{calculations.deductions.toLocaleString('en-IN')}</div>
          <div className="highlight">
            After Deductions: ₹{calculations.ctcAfterDed.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* RSU & ESPP */}
      <div className="card">
        <h3>Equity Income</h3>

        <EditableNumber
          label="RSU Shares This FY"
          field="in_rsuThisFy"
          value={state.in_rsuThisFy}
          suffix="shares"
        />

        <EditableNumber
          label="Share Price"
          field="in_sharePrice"
          value={state.in_sharePrice}
          suffix="$"
        />

        <EditableNumber
          label="USD to INR Rate"
          field="in_usdInr"
          value={state.in_usdInr}
          suffix="₹/$"
        />

        <div className="note">
          RSU Value: ₹{calculations.rsuValue.toLocaleString('en-IN', {
            maximumFractionDigits: 0,
          })}
        </div>

        <EditableNumber
          label="RSU Tax Rate"
          field="in_vestTaxRate"
          value={state.in_vestTaxRate}
          suffix="%"
        />

        <div className="note">
          RSU Tax: ₹{calculations.rsuTax.toLocaleString('en-IN', {
            maximumFractionDigits: 0,
          })}
        </div>

        <div className="summary-box">
          <div className="highlight">
            RSU After Tax: ₹{calculations.rsuAfterTax.toLocaleString('en-IN', {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        <EditableNumber
          label="Cash Award This FY"
          field="in_cashAwardThisFy"
          value={state.in_cashAwardThisFy}
          suffix="₹"
        />

        <EditableNumber
          label="ESPP"
          field="in_espp"
          value={state.in_espp}
          suffix="₹"
        />
      </div>

      {/* Tax Calculation */}
      <div className="card">
        <h3>Tax Calculation (New Regime)</h3>

        <EditableNumber
          label="Standard Deduction"
          field="in_stdDed"
          value={state.in_stdDed}
          suffix="₹"
        />

        <div className="summary-box">
          <div>Salary Income: ₹{calculations.ctcAfterDed.toLocaleString('en-IN')}</div>
          <div>+ RSU Income: ₹{calculations.rsuValue.toLocaleString('en-IN', {
            maximumFractionDigits: 0,
          })}</div>
          <div>- Std Deduction: ₹{state.in_stdDed.toLocaleString('en-IN')}</div>
          <div className="highlight">
            Taxable Income: ₹{calculations.totalTaxableIncome.toLocaleString('en-IN', {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        <div className="summary-box tax-summary">
          <div>Income Tax: ₹{calculations.incomeTax.toLocaleString('en-IN', {
            maximumFractionDigits: 0,
          })}</div>
          <div className="highlight">
            Effective Tax Rate: {calculations.taxRate.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Annual Summary */}
      <div className="card">
        <h3>Annual Summary</h3>

        <div className="summary-box">
          <div>Salary (after PF): ₹{calculations.ctcAfterDed.toLocaleString('en-IN')}</div>
          <div>RSU (after tax): ₹{calculations.rsuAfterTax.toLocaleString('en-IN', {
            maximumFractionDigits: 0,
          })}</div>
          <div>Cash Award: ₹{calculations.cashAward.toLocaleString('en-IN')}</div>
          <div>ESPP: ₹{calculations.espp.toLocaleString('en-IN')}</div>
          <div>- Income Tax: ₹{calculations.incomeTax.toLocaleString('en-IN', {
            maximumFractionDigits: 0,
          })}</div>
          <div className="highlight">
            In Hand (Annual): ₹{calculations.inHand.toLocaleString('en-IN', {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
