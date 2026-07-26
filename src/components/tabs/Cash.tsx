import React, { useState, useMemo } from 'react';
import { useAppState } from '../../store/Store';
import { evalExpr } from '../../services/expressionEvaluator';

export default function Cash() {
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
    const icCash = state.in_icCash;
    const ncAccountsValue = state.accountsRows
      .filter((acc) => acc.currency === 'NPR')
      .reduce((sum, acc) => sum + acc.amount, 0);
    const ncCashInr = ncAccountsValue * (1 / state.in_npr_peg);
    const totalCash = icCash + ncCashInr;

    const shieldTarget = state.in_essentialCosts * state.in_shieldMonths;
    const shieldCurrent = totalCash;
    const shieldHealth = shieldCurrent / (shieldTarget || 1);

    const comfortTarget = state.in_comfortEmi * state.in_shieldMonths;
    const comfortHealth = shieldCurrent / (comfortTarget || 1);

    return {
      icCash,
      ncAccountsValue,
      ncCashInr,
      totalCash,
      shieldTarget,
      shieldCurrent,
      shieldHealth,
      comfortTarget,
      comfortHealth,
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

  const getHealthStatus = (ratio: number) => {
    if (ratio >= 1) return { text: '✓ OK', color: 'var(--teal)' };
    if (ratio >= 0.75) return { text: '⚠ At Risk', color: 'var(--gold)' };
    return { text: '✕ Critical', color: 'var(--rose)' };
  };

  return (
    <section id="cash" className="active" className="active">
      <h2 className="title">Cash Buckets</h2>
      <p className="subtitle">Emergency Shield & Comfort Fund tracking</p>

      {/* Current Cash */}
      <div className="card">
        <h3>Current Liquid Cash</h3>

        <div className="stat-line">
          <span className="k">India-side (IC)</span>
          <span className="v mono">₹{formatCurrency(calculations.icCash)}</span>
        </div>

        <div className="stat-line">
          <span className="k">Nepal-side (NPR → INR)</span>
          <span className="v mono">
            ₹{formatCurrency(calculations.ncCashInr)}
          </span>
        </div>

        <div className="stat-line total">
          <span className="k">Total Cash Available</span>
          <span className="v gold mono">
            ₹{formatCurrency(calculations.totalCash)}
          </span>
        </div>
      </div>

      {/* Emergency Shield */}
      <div className="card">
        <h3>Emergency Shield Fund</h3>
        <p className="note">Essential costs × months buffer</p>

        <EditableNumber
          label="Essential Monthly Costs"
          field="in_essentialCosts"
          value={state.in_essentialCosts}
          suffix="₹"
        />

        <EditableNumber
          label="Shield Duration"
          field="in_shieldMonths"
          value={state.in_shieldMonths}
          suffix="months"
        />

        <div className="summary-box">
          <div>
            <strong>Target Shield Fund:</strong> ₹
            {formatCurrency(calculations.shieldTarget)}
          </div>
          <div style={{ marginTop: '8px' }}>
            <strong>Current Cash:</strong> ₹
            {formatCurrency(calculations.shieldCurrent)}
          </div>
          <div
            className="highlight"
            style={{ marginTop: '12px', color: getHealthStatus(calculations.shieldHealth).color }}
          >
            <strong>Status:</strong> {getHealthStatus(calculations.shieldHealth).text}
          </div>
          <div className="note" style={{ marginTop: '8px' }}>
            Coverage: {(calculations.shieldHealth * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Comfort Fund */}
      <div className="card">
        <h3>Comfort Fund (EMI Buffer)</h3>
        <p className="note">Covers EMI payments + emergency</p>

        <EditableNumber
          label="Monthly EMI / Comfort Payment"
          field="in_comfortEmi"
          value={state.in_comfortEmi}
          suffix="₹"
        />

        <div className="summary-box">
          <div>
            <strong>Target Comfort Fund:</strong> ₹
            {formatCurrency(calculations.comfortTarget)}
          </div>
          <div style={{ marginTop: '8px' }}>
            <strong>Current Cash:</strong> ₹
            {formatCurrency(calculations.shieldCurrent)}
          </div>
          <div
            className="highlight"
            style={{ marginTop: '12px', color: getHealthStatus(calculations.comfortHealth).color }}
          >
            <strong>Status:</strong> {getHealthStatus(calculations.comfortHealth).text}
          </div>
          <div className="note" style={{ marginTop: '8px' }}>
            Coverage: {(calculations.comfortHealth * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* NPR Exchange */}
      <div className="card">
        <h3>Nepal Rupee (NPR) Exchange</h3>

        <EditableNumber
          label="NPR to INR Peg Rate"
          field="in_npr_peg"
          value={state.in_npr_peg}
          suffix=""
        />

        <div className="note">
          1 NPR = 1/{state.in_npr_peg.toFixed(2)} INR
        </div>

        <div className="summary-box" style={{ marginTop: '12px' }}>
          <div>
            <strong>Total NPR in Accounts:</strong> ₨
            {formatCurrency(calculations.ncAccountsValue)}
          </div>
          <div style={{ marginTop: '8px' }}>
            <strong>Equivalent in INR:</strong> ₹
            {formatCurrency(calculations.ncCashInr)}
          </div>
        </div>
      </div>
    </section>
  );
}
