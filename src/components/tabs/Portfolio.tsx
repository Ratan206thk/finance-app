import React, { useState } from 'react';
import { useAppState } from '../../store/Store';
import { evalExpr } from '../../services/expressionEvaluator';
import { SIPRow } from '../../types';

export default function Portfolio() {
  const { state, updateTableRow, addTableRow, removeTableRow } = useAppState();
  const [editingCell, setEditingCell] = useState<{
    rowIdx: number;
    field: keyof SIPRow;
  } | null>(null);

  const handleCellChange = (
    rowIdx: number,
    field: keyof SIPRow,
    value: string
  ) => {
    if (field === 'name' || field === 'cat') {
      updateTableRow('sipRows', rowIdx, field, value);
    } else {
      const numValue = evalExpr(value);
      updateTableRow('sipRows', rowIdx, field, numValue);
    }
  };

  const handleAddRow = () => {
    const newRow: SIPRow = {
      name: '',
      cat: 'Other',
      sip: 0,
      val: 0,
    };
    addTableRow('sipRows', newRow);
  };

  const handleRemoveRow = (idx: number) => {
    removeTableRow('sipRows', idx);
  };

  const formatCurrency = (val: number): string => {
    return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  // Calculate totals by category
  const totals = state.sipRows.reduce(
    (acc, row) => {
      acc[row.cat] = (acc[row.cat] || { sip: 0, val: 0 });
      acc[row.cat].sip += row.sip;
      acc[row.cat].val += row.val;
      acc.totalSip += row.sip;
      acc.totalVal += row.val;
      return acc;
    },
    {
      'Small Cap': { sip: 0, val: 0 },
      'Flexi Cap': { sip: 0, val: 0 },
      'Large Cap': { sip: 0, val: 0 },
      Debt: { sip: 0, val: 0 },
      Other: { sip: 0, val: 0 },
      totalSip: 0,
      totalVal: 0,
    }
  );

  const categories: Array<'Small Cap' | 'Flexi Cap' | 'Large Cap' | 'Debt' | 'Other'> = [
    'Small Cap',
    'Flexi Cap',
    'Large Cap',
    'Debt',
    'Other',
  ];

  return (
    <section id="portfolio" className="active" className="active">
      <h2 className="title">Portfolio (Mutual Funds SIP)</h2>
      <p className="subtitle">Systematic Investment Plan tracking by fund and category</p>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fund Name</th>
              <th>Category</th>
              <th>Monthly SIP</th>
              <th>Current Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.sipRows.map((row, idx) => (
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
                  {editingCell?.rowIdx === idx && editingCell.field === 'cat' ? (
                    <select
                      autoFocus
                      value={row.cat}
                      onChange={(e) => {
                        handleCellChange(
                          idx,
                          'cat',
                          e.target.value as SIPRow['cat']
                        );
                        setEditingCell(null);
                      }}
                      onBlur={() => setEditingCell(null)}
                    >
                      <option value="Small Cap">Small Cap</option>
                      <option value="Flexi Cap">Flexi Cap</option>
                      <option value="Large Cap">Large Cap</option>
                      <option value="Debt">Debt</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <span
                      onClick={() =>
                        setEditingCell({ rowIdx: idx, field: 'cat' })
                      }
                      className="editable-cell"
                    >
                      {row.cat}
                    </span>
                  )}
                </td>

                <td className="numeric">
                  {editingCell?.rowIdx === idx && editingCell.field === 'sip' ? (
                    <input
                      autoFocus
                      type="text"
                      value={row.sip}
                      onChange={(e) => {
                        handleCellChange(idx, 'sip', e.target.value);
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
                        setEditingCell({ rowIdx: idx, field: 'sip' })
                      }
                      className="editable-cell"
                    >
                      ₹{formatCurrency(row.sip)}
                    </span>
                  )}
                </td>

                <td className="numeric">
                  {editingCell?.rowIdx === idx && editingCell.field === 'val' ? (
                    <input
                      autoFocus
                      type="text"
                      value={row.val}
                      onChange={(e) => {
                        handleCellChange(idx, 'val', e.target.value);
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
                        setEditingCell({ rowIdx: idx, field: 'val' })
                      }
                      className="editable-cell"
                    >
                      ₹{formatCurrency(row.val)}
                    </span>
                  )}
                </td>

                <td className="actions">
                  <button
                    className="btn small ghost danger"
                    onClick={() => handleRemoveRow(idx)}
                    title="Delete fund"
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
          + Add Fund
        </button>
      </div>

      {/* Summary by Category */}
      <div className="grid" style={{ marginTop: '24px' }}>
        {categories.map((cat) => (
          <div key={cat} className="card">
            <h3>{cat}</h3>
            <div className="stat-line">
              <span className="k">Monthly SIP</span>
              <span className="v mono">₹{formatCurrency(totals[cat].sip)}</span>
            </div>
            <div className="stat-line total">
              <span className="k">Current Value</span>
              <span className="v gold mono">
                ₹{formatCurrency(totals[cat].val)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Summary */}
      <div className="summary-box" style={{ marginTop: '24px' }}>
        <h3>Total Portfolio</h3>
        <div>
          <strong>Total Monthly SIP:</strong> ₹{formatCurrency(totals.totalSip)}
        </div>
        <div style={{ marginTop: '8px' }}>
          <strong>Total Current Value:</strong> ₹{formatCurrency(totals.totalVal)}
        </div>
        <div className="highlight" style={{ marginTop: '12px' }}>
          <strong>Annual SIP Contribution:</strong> ₹
          {formatCurrency(totals.totalSip * 12)}
        </div>
      </div>
    </section>
  );
}
