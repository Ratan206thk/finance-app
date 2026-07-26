import React, { useState } from 'react';
import { useAppState } from '../../store/Store';
import { evalExpr } from '../../services/expressionEvaluator';
import { LedgerRow } from '../../types';

export default function Ledger() {
  const { state, updateTableRow, addTableRow, removeTableRow } = useAppState();
  const [editingCell, setEditingCell] = useState<{
    rowIdx: number;
    field: keyof LedgerRow;
  } | null>(null);

  const handleCellChange = (
    rowIdx: number,
    field: keyof LedgerRow,
    value: string
  ) => {
    const numValue = evalExpr(value);
    updateTableRow('ledgerRows', rowIdx, field, numValue);
  };

  const handleAddRow = () => {
    const newRow: LedgerRow = {
      month: '',
      bonus: 0,
      earning: 0,
      personalExp: 0,
      familyExp: 0,
      investRent: 0,
      pfNpsEtc: 0,
      saving: 0,
    };
    addTableRow('ledgerRows', newRow);
  };

  const handleRemoveRow = (idx: number) => {
    removeTableRow('ledgerRows', idx);
  };

  const calculateSaving = (row: LedgerRow) => {
    return (
      row.bonus +
      row.earning -
      row.personalExp -
      row.familyExp -
      row.investRent -
      row.pfNpsEtc
    );
  };

  const formatCurrency = (val: number): string => {
    return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <section id="ledger" className="active" className="active">
      <h2 className="title">Monthly Ledger (26 months)</h2>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Bonus</th>
              <th>Earning</th>
              <th>Personal Exp</th>
              <th>Family Exp</th>
              <th>Invest/Rent</th>
              <th>PF/NPS etc</th>
              <th>Saving</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.ledgerRows.map((row, idx) => (
              <tr key={idx}>
                <td>
                  {editingCell?.rowIdx === idx && editingCell.field === 'month' ? (
                    <input
                      autoFocus
                      type="text"
                      value={row.month}
                      onChange={(e) => {
                        updateTableRow('ledgerRows', idx, 'month', e.target.value);
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
                        setEditingCell({ rowIdx: idx, field: 'month' })
                      }
                      className="editable-cell"
                    >
                      {row.month}
                    </span>
                  )}
                </td>

                {(['bonus', 'earning', 'personalExp', 'familyExp', 'investRent', 'pfNpsEtc'] as const).map(
                  (field) => (
                    <td key={field} className="numeric">
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === field ? (
                        <input
                          autoFocus
                          type="text"
                          value={row[field]}
                          onChange={(e) => {
                            handleCellChange(idx, field, e.target.value);
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
                            setEditingCell({ rowIdx: idx, field })
                          }
                          className="editable-cell"
                        >
                          ₹{formatCurrency(row[field])}
                        </span>
                      )}
                    </td>
                  )
                )}

                <td className="numeric saving">
                  ₹{formatCurrency(calculateSaving(row))}
                </td>

                <td className="actions">
                  <button
                    className="btn small ghost danger"
                    onClick={() => handleRemoveRow(idx)}
                    title="Delete row"
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
          + Add Month
        </button>
      </div>

      <div className="note">
        {state.ledgerRows.length} months tracked.
        {state.ledgerRows.length > 0 && (
          <> Total Saving: ₹{formatCurrency(
            state.ledgerRows.reduce((sum, row) => sum + calculateSaving(row), 0)
          )}</>
        )}
      </div>
    </section>
  );
}
