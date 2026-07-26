import React, { useState } from 'react';
import { useAppState } from '../../store/Store';
import { evalExpr } from '../../services/expressionEvaluator';
import { LendenRow } from '../../types';

export default function Lenden() {
  const { state, updateTableRow, addTableRow, removeTableRow } = useAppState();
  const [editingCell, setEditingCell] = useState<{
    rowIdx: number;
    field: keyof LendenRow;
  } | null>(null);

  const handleCellChange = (
    rowIdx: number,
    field: keyof LendenRow,
    value: string
  ) => {
    if (field === 'amount') {
      const numValue = evalExpr(value);
      updateTableRow('lendenRows', rowIdx, field, numValue);
    } else {
      updateTableRow('lendenRows', rowIdx, field, value);
    }
  };

  const handleAddRow = () => {
    const newRow: LendenRow = {
      person: '',
      amount: 0,
    };
    addTableRow('lendenRows', newRow);
  };

  const handleRemoveRow = (idx: number) => {
    removeTableRow('lendenRows', idx);
  };

  const formatCurrency = (val: number): string => {
    return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  // Calculate totals
  const totals = state.lendenRows.reduce(
    (acc, row) => {
      if (row.amount > 0) {
        acc.owed += row.amount; // Positive = they owe you
      } else {
        acc.borrowed += Math.abs(row.amount); // Negative = you owe them
      }
      return acc;
    },
    { owed: 0, borrowed: 0 }
  );

  const netLending = totals.owed - totals.borrowed;

  return (
    <section id="lenden" className="active" className="active">
      <h2 className="title">Lending Ledger</h2>
      <p className="subtitle">
        Track who owes you (positive) and who you owe (negative).
      </p>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Person / Account</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.lendenRows.map((row, idx) => {
              const isOweYou = row.amount > 0;
              return (
                <tr key={idx} className={isOweYou ? 'positive' : 'negative'}>
                  <td>
                    {editingCell?.rowIdx === idx &&
                    editingCell.field === 'person' ? (
                      <input
                        autoFocus
                        type="text"
                        value={row.person}
                        onChange={(e) => {
                          handleCellChange(idx, 'person', e.target.value);
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
                          setEditingCell({ rowIdx: idx, field: 'person' })
                        }
                        className="editable-cell"
                      >
                        {row.person}
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
                        {isOweYou ? '+' : ''}₹{formatCurrency(row.amount)}
                      </span>
                    )}
                  </td>

                  <td className="status">
                    <span className={isOweYou ? 'badge success' : 'badge danger'}>
                      {isOweYou ? 'They Owe You' : 'You Owe Them'}
                    </span>
                  </td>

                  <td className="actions">
                    <button
                      className="btn small ghost danger"
                      onClick={() => handleRemoveRow(idx)}
                      title="Delete entry"
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
          + Add Entry
        </button>
      </div>

      {/* Summary */}
      <div className="summary-box" style={{ marginTop: '24px' }}>
        <h3>Summary</h3>
        <div className="positive">
          <strong>People Who Owe You:</strong> ₹{formatCurrency(totals.owed)}
        </div>
        <div className="negative" style={{ marginTop: '8px' }}>
          <strong>You Owe People:</strong> ₹{formatCurrency(totals.borrowed)}
        </div>
        <div className="highlight" style={{ marginTop: '12px' }}>
          <strong>
            Net Position: {netLending >= 0 ? '+ ' : ''}₹{formatCurrency(Math.abs(netLending))}
          </strong>
          <div className="note" style={{ marginTop: '4px' }}>
            {netLending > 0
              ? 'Overall, people owe you money'
              : netLending < 0
              ? 'Overall, you owe people money'
              : 'Balanced'}
          </div>
        </div>
      </div>
    </section>
  );
}
