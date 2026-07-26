import React, { useState } from 'react';
import { useAppState } from '../../store/Store';
import { evalExpr } from '../../services/expressionEvaluator';
import { AccountRow } from '../../types';

export default function Accounts() {
  const { state, updateTableRow, addTableRow, removeTableRow } = useAppState();
  const [editingCell, setEditingCell] = useState<{
    rowIdx: number;
    field: keyof AccountRow;
  } | null>(null);

  const handleCellChange = (
    rowIdx: number,
    field: keyof AccountRow,
    value: string
  ) => {
    if (field === 'amount') {
      const numValue = evalExpr(value);
      updateTableRow('accountsRows', rowIdx, field, numValue);
    } else {
      updateTableRow('accountsRows', rowIdx, field, value);
    }
  };

  const handleAddRow = () => {
    const newRow: AccountRow = {
      name: '',
      currency: 'INR',
      amount: 0,
    };
    addTableRow('accountsRows', newRow);
  };

  const handleRemoveRow = (idx: number) => {
    removeTableRow('accountsRows', idx);
  };

  const formatCurrency = (val: number): string => {
    return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  // Calculate totals by currency
  const totals = state.accountsRows.reduce(
    (acc, row) => {
      if (row.currency === 'INR') {
        acc.inr += row.amount;
      } else {
        acc.npr += row.amount;
      }
      return acc;
    },
    { inr: 0, npr: 0 }
  );

  // Rough NPR to INR conversion (user can update)
  const nprToInr = totals.npr * (1 / state.in_npr_peg);

  return (
    <section id="accounts" className="active" className="active">
      <h2 className="title">Bank Accounts</h2>
      <p className="subtitle">Multi-currency tracking (INR and NPR)</p>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Currency</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.accountsRows.map((row, idx) => (
              <tr key={idx}>
                <td>
                  {editingCell?.rowIdx === idx && editingCell.field === 'name' ? (
                    <input
                      autoFocus
                      type="text"
                      value={row.name}
                      onChange={(e) => {
                        handleCellChange(idx, 'name', e.target.value);
                        setEditingCell(null);
                      }}
                      onBlur={() => setEditingCell(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingCell(null);
                      }}
                    />
                  ) : (
                    <span
                      onClick={() =>
                        setEditingCell({ rowIdx: idx, field: 'name' })
                      }
                      className="editable-cell"
                    >
                      {row.name}
                    </span>
                  )}
                </td>

                <td>
                  {editingCell?.rowIdx === idx && editingCell.field === 'currency' ? (
                    <select
                      autoFocus
                      value={row.currency}
                      onChange={(e) => {
                        handleCellChange(idx, 'currency', e.target.value);
                        setEditingCell(null);
                      }}
                      onBlur={() => setEditingCell(null)}
                    >
                      <option value="INR">INR</option>
                      <option value="NPR">NPR</option>
                    </select>
                  ) : (
                    <span
                      onClick={() =>
                        setEditingCell({ rowIdx: idx, field: 'currency' })
                      }
                      className="editable-cell"
                    >
                      {row.currency}
                    </span>
                  )}
                </td>

                <td className="numeric">
                  {editingCell?.rowIdx === idx &&
                  editingCell.field === 'amount' ? (
                    <input
                      autoFocus
                      type="text"
                      value={row.amount}
                      onChange={(e) => {
                        handleCellChange(idx, 'amount', e.target.value);
                      }}
                      onBlur={() => setEditingCell(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingCell(null);
                      }}
                      className="cell-input"
                    />
                  ) : (
                    <span
                      onClick={() =>
                        setEditingCell({ rowIdx: idx, field: 'amount' })
                      }
                      className="editable-cell"
                    >
                      {row.currency === 'INR' ? '₹' : '₨'}
                      {formatCurrency(row.amount)}
                    </span>
                  )}
                </td>

                <td className="actions">
                  <button
                    className="btn small ghost danger"
                    onClick={() => handleRemoveRow(idx)}
                    title="Delete account"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-group" style={{ marginTop: '16px' }}>
        <button className="btn" onClick={handleAddRow}>
          + Add Account
        </button>
      </div>

      {/* Summary by currency */}
      <div className="summary-box" style={{ marginTop: '24px' }}>
        <h3>Total by Currency</h3>
        <div>
          <strong>INR:</strong> ₹{formatCurrency(totals.inr)}
        </div>
        <div>
          <strong>NPR:</strong> ₨{formatCurrency(totals.npr)}
        </div>
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--gray)' }}>
          <strong>NPR to INR conversion rate (peg):</strong>
          <div className="note" style={{ marginTop: '4px' }}>
            1 NPR = 1/{state.in_npr_peg.toFixed(2)} INR
          </div>
          <div className="note">
            NPR value in INR: ₹{formatCurrency(nprToInr)}
          </div>
        </div>
        <div className="highlight" style={{ marginTop: '12px' }}>
          <strong>Total (in INR):</strong> ₹{formatCurrency(totals.inr + nprToInr)}
        </div>
      </div>
    </section>
  );
}
