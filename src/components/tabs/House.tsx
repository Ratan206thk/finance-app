import React, { useState, useMemo } from 'react';
import { useAppState } from '../../store/Store';
import { evalExpr } from '../../services/expressionEvaluator';

export default function House() {
  const { state, updateField } = useAppState();
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleEdit = (field: string, value: string) => {
    const key = field as keyof typeof state;
    const numValue = evalExpr(value);
    if (key.startsWith('in_')) {
      updateField(key, numValue);
    }
  };

  const calculations = useMemo(() => {
    const targetYear = state.in_targetYear;
    const currentYear = new Date().getFullYear();
    const yearsUntilTarget = targetYear - currentYear;

    // Estimate house price (based on common Indian market)
    // You can make this configurable if needed
    const estimatedHousePrice = 6000000; // ₹60 lakhs

    const downPaymentPercent = state.in_downPct;
    const downPaymentAmount = (estimatedHousePrice * downPaymentPercent) / 100;
    const loanAmount = estimatedHousePrice - downPaymentAmount;

    // EMI Calculation: P * r * (1+r)^n / ((1+r)^n - 1)
    const monthlyRate = state.in_loanRate / 100 / 12;
    const numMonths = state.in_loanTenure * 12;
    const emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numMonths)) /
      (Math.pow(1 + monthlyRate, numMonths) - 1);

    const maxMonthlyPayment = state.in_comfortEmi;
    const maxAffordable = (maxMonthlyPayment * numMonths * (Math.pow(1 + monthlyRate, numMonths) - 1)) /
      (monthlyRate * Math.pow(1 + monthlyRate, numMonths));

    const isEmiAffordable = emi <= maxMonthlyPayment;
    const emiPercent = (emi / state.in_essentialCosts) * 100;

    // Down payment readiness
    const currentCash =
      state.in_icCash +
      state.accountsRows
        .filter((acc) => acc.currency === 'INR')
        .reduce((sum, acc) => sum + acc.amount, 0);
    const downPaymentReady = currentCash >= downPaymentAmount;

    return {
      targetYear,
      yearsUntilTarget,
      estimatedHousePrice,
      downPaymentPercent,
      downPaymentAmount,
      downPaymentReady,
      currentCash,
      loanAmount,
      monthlyRate,
      numMonths,
      emi,
      maxMonthlyPayment,
      isEmiAffordable,
      emiPercent,
      maxAffordable,
    };
  }, [state]);

  const EditableNumber = ({
    label,
    field,
    value,
    suffix = '',
  }: {
    label: string;
    field: string;
    value: number;
    suffix?: string;
  }) => (
    <div className="input-row">
      <label>{label}</label>
      {editingField === field ? (
        <input
          autoFocus
          type="text"
          defaultValue={value}
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
          <span>{value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          <span className="suffix">{suffix}</span>
        </div>
      )}
    </div>
  );

  const formatCurrency = (val: number): string => {
    return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <section id="house" className="active" className="active">
      <h2 className="title">House Goal Planning</h2>
      <p className="subtitle">Mortgage affordability & down payment readiness</p>

      {/* Goal Parameters */}
      <div className="card">
        <h3>Goal Timeline & Parameters</h3>

        <EditableNumber
          label="Target Purchase Year"
          field="in_targetYear"
          value={state.in_targetYear}
          suffix=""
        />
        <div className="note">
          {calculations.yearsUntilTarget > 0
            ? `${calculations.yearsUntilTarget} years away`
            : 'Target year has passed'}
        </div>

        <EditableNumber
          label="Down Payment %"
          field="in_downPct"
          value={state.in_downPct}
          suffix="%"
        />

        <EditableNumber
          label="Loan Tenure (years)"
          field="in_loanTenure"
          value={state.in_loanTenure}
          suffix="years"
        />

        <EditableNumber
          label="Loan Interest Rate"
          field="in_loanRate"
          value={state.in_loanRate}
          suffix="% p.a."
        />

        <EditableNumber
          label="Max Monthly Payment (EMI %)"
          field="in_emiPct"
          value={state.in_emiPct}
          suffix="% of salary"
        />
      </div>

      {/* Estimated House */}
      <div className="card">
        <h3>Estimated House Value</h3>

        <div className="summary-box">
          <div>
            <strong>Estimated Price:</strong> ₹
            {formatCurrency(calculations.estimatedHousePrice)}
          </div>
          <div style={{ marginTop: '8px' }}>
            <strong>Down Payment ({state.in_downPct}%):</strong> ₹
            {formatCurrency(calculations.downPaymentAmount)}
          </div>
          <div style={{ marginTop: '8px' }}>
            <strong>Loan Amount:</strong> ₹
            {formatCurrency(calculations.loanAmount)}
          </div>
        </div>

        <div className="note" style={{ marginTop: '16px' }}>
          This is a placeholder estimate. Update the house price to match your target property.
        </div>
      </div>

      {/* Down Payment Readiness */}
      <div className="card">
        <h3>Down Payment Readiness</h3>

        <div className="summary-box">
          <div>
            <strong>Target Down Payment:</strong> ₹
            {formatCurrency(calculations.downPaymentAmount)}
          </div>
          <div style={{ marginTop: '8px' }}>
            <strong>Current Cash (INR only):</strong> ₹
            {formatCurrency(calculations.currentCash)}
          </div>
          <div
            className="highlight"
            style={{
              marginTop: '12px',
              color: calculations.downPaymentReady ? 'var(--teal)' : 'var(--rose)',
            }}
          >
            {calculations.downPaymentReady ? '✓ Ready' : '✕ Not Ready'}
          </div>
          {!calculations.downPaymentReady && (
            <div className="note" style={{ marginTop: '8px', color: 'var(--rose)' }}>
              Need ₹
              {formatCurrency(calculations.downPaymentAmount - calculations.currentCash)} more
            </div>
          )}
        </div>
      </div>

      {/* EMI Affordability */}
      <div className="card">
        <h3>EMI Affordability</h3>

        <div className="summary-box">
          <div>
            <strong>Estimated Monthly EMI:</strong> ₹
            {formatCurrency(calculations.emi)}
          </div>
          <div style={{ marginTop: '8px' }}>
            <strong>Max Recommended EMI:</strong> ₹
            {formatCurrency(calculations.maxMonthlyPayment)}
          </div>
          <div
            className="highlight"
            style={{
              marginTop: '12px',
              color: calculations.isEmiAffordable ? 'var(--teal)' : 'var(--rose)',
            }}
          >
            {calculations.isEmiAffordable ? '✓ Affordable' : '✕ Too High'}
          </div>
          <div className="note" style={{ marginTop: '8px' }}>
            EMI is {calculations.emiPercent.toFixed(1)}% of essential costs
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h3>Overall Readiness</h3>

        <div className="stat-line">
          <span className="k">Down Payment Ready?</span>
          <span
            className="v"
            style={{
              color: calculations.downPaymentReady ? 'var(--teal)' : 'var(--rose)',
            }}
          >
            {calculations.downPaymentReady ? '✓ Yes' : '✕ No'}
          </span>
        </div>

        <div className="stat-line">
          <span className="k">EMI Affordable?</span>
          <span
            className="v"
            style={{
              color: calculations.isEmiAffordable ? 'var(--teal)' : 'var(--rose)',
            }}
          >
            {calculations.isEmiAffordable ? '✓ Yes' : '✕ No'}
          </span>
        </div>

        <div className="stat-line total">
          <span className="k">Overall Status</span>
          <span
            className="v"
            style={{
              color:
                calculations.downPaymentReady && calculations.isEmiAffordable
                  ? 'var(--teal)'
                  : 'var(--rose)',
            }}
          >
            {calculations.downPaymentReady && calculations.isEmiAffordable
              ? '✓ Ready to Buy'
              : '✗ Not Ready Yet'}
          </span>
        </div>
      </div>
    </section>
  );
}
