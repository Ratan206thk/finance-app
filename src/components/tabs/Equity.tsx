import React, { useState } from 'react';
import { useAppState } from '../../store/Store';
import { evalExpr } from '../../services/expressionEvaluator';
import { RSURow } from '../../types';

export default function Equity() {
  const { state, updateTableRow, addTableRow, removeTableRow } = useAppState();
  const [editingCell, setEditingCell] = useState<{
    rowIdx: number;
    field: keyof RSURow;
  } | null>(null);

  const handleCellChange = (
    rowIdx: number,
    field: keyof RSURow,
    value: string
  ) => {
    if (field === 'date') {
      updateTableRow('rsuRows', rowIdx, field, value);
    } else {
      const numValue = evalExpr(value);
      updateTableRow('rsuRows', rowIdx, field, numValue);
    }
  };

  const handleAddRow = () => {
    const newRow: RSURow = {
      date: '',
      shares: 0,
      cash: 0,
    };
    addTableRow('rsuRows', newRow);
  };

  const handleRemoveRow = (idx: number) => {
    removeTableRow('rsuRows', idx);
  };

  const formatCurrency = (val: number): string => {
    return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  // Calculate total vesting value and shares
  const totals = state.rsuRows.reduce(
    (acc, row) => {
      acc.totalShares += row.shares;
      acc.totalCash += row.cash;
      const rowValue = row.shares * state.in_sharePrice * state.in_usdInr + row.cash;
      acc.totalValue += rowValue;
      return acc;
    },
    { totalShares: 0, totalCash: 0, totalValue: 0 }
  );

  return (
    <section id="equity" className="active" className="active">
      <h2 className="title">RSU & ESPP</h2>
      <p className="subtitle">
        Equity vesting schedule. Share Price: ${state.in_sharePrice.toFixed(2)}, USD/INR: {state.in_usdInr.toFixed(2)}
      </p>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vesting Date</th>
              <th>Shares</th>
              <th>Cash Award (₹)</th>
              <th>Value @ Current Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.rsuRows.map((row, idx) => {
              const rowValue =
                row.shares * state.in_sharePrice * state.in_usdInr + row.cash;
              return (
                <tr key={idx}>
                  <td>
                    {editingCell?.rowIdx === idx && editingCell.field === 'date' ? (
                      <input
                        autoFocus
                        type="text"
                        value={row.date}
                        onChange={(e) => {
                          handleCellChange(idx, 'date', e.target.value);
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
                          setEditingCell({ rowIdx: idx, field: 'date' })
                        }
                        className="editable-cell"
                      >
                        {row.date}
                      </span>
                    )}
                  </td>

                  <td className="numeric">
                    {editingCell?.rowIdx === idx &&
                    editingCell.field === 'shares' ? (
                      <input
                        autoFocus
                        type="text"
                        value={row.shares}
                        onChange={(e) => {
                          handleCellChange(idx, 'shares', e.target.value);
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
                          setEditingCell({ rowIdx: idx, field: 'shares' })
                        }
                        className="editable-cell"
                      >
                        {row.shares}
                      </span>
                    )}
                  </td>

                  <td className="numeric">
                    {editingCell?.rowIdx === idx && editingCell.field === 'cash' ? (
                      <input
                        autoFocus
                        type="text"
                        value={row.cash}
                        onChange={(e) => {
                          handleCellChange(idx, 'cash', e.target.value);
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
                          setEditingCell({ rowIdx: idx, field: 'cash' })
                        }
                        className="editable-cell"
                      >
                        ₹{formatCurrency(row.cash)}
                      </span>
                    )}
                  </td>

                  <td className="numeric highlight">
                    ₹{formatCurrency(rowValue)}
                  </td>

                  <td className="actions">
                    <button
                      className="btn small ghost danger"
                      onClick={() => handleRemoveRow(idx)}
                      title="Delete vesting"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="button-group" style={{ marginTop: '16px' }}>
        <button className="btn" onClick={handleAddRow}>
          + Add Vesting
        </button>
      </div>

      {/* Summary */}
      <div className="summary-box" style={{ marginTop: '24px' }}>
        <h3>Total Equity Value</h3>
        <div>
          <strong>Total Shares:</strong> {totals.totalShares}
        </div>
        <div style={{ marginTop: '8px' }}>
          <strong>Total Cash Awards:</strong> ₹{formatCurrency(totals.totalCash)}
        </div>
        <div className="highlight" style={{ marginTop: '12px' }}>
          <strong>
            Total Value (at current price): ₹{formatCurrency(totals.totalValue)}
          </strong>
        </div>
      </div>
    </section>
  );
}
