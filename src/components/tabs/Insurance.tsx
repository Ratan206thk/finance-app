import React, { useState } from 'react';
import { useAppState } from '../../store/Store';
import { evalExpr } from '../../services/expressionEvaluator';
import { InsuranceRow, ArchivedInsuranceRow } from '../../types';

export default function Insurance() {
  const { state, updateTableRow, addTableRow, removeTableRow } = useAppState();
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [editingCell, setEditingCell] = useState<{
    rowIdx: number;
    field: string;
    isArchived: boolean;
  } | null>(null);

  const handleCellChange = (
    rowIdx: number,
    field: string,
    value: string,
    isArchived: boolean
  ) => {
    const numFields = ['sumAssured', 'premium', 'pendingAmount'];
    if (numFields.includes(field)) {
      const numValue = evalExpr(value);
      updateTableRow(
        isArchived ? 'archivedInsuranceRows' : 'insuranceRows',
        rowIdx,
        field,
        numValue
      );
    } else {
      updateTableRow(
        isArchived ? 'archivedInsuranceRows' : 'insuranceRows',
        rowIdx,
        field,
        value
      );
    }
  };

  const handleAddRow = () => {
    if (tab === 'active') {
      const newRow: InsuranceRow = {
        policyNo: '',
        insured: '',
        sumAssured: 0,
        premium: 0,
        endDate: '',
        pendingAmount: 0,
      };
      addTableRow('insuranceRows', newRow);
    } else {
      const newRow: ArchivedInsuranceRow = {
        policyNo: '',
        insured: '',
        sumAssured: 0,
        premium: 0,
        endDate: '',
        status: '',
      };
      addTableRow('archivedInsuranceRows', newRow);
    }
  };

  const handleRemoveRow = (idx: number) => {
    removeTableRow(
      tab === 'active' ? 'insuranceRows' : 'archivedInsuranceRows',
      idx
    );
  };

  const formatCurrency = (val: number): string => {
    return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const EditableCell = ({
    value,
    rowIdx,
    field,
    isCurrency = false,
    isArchived = false,
  }: {
    value: string | number;
    rowIdx: number;
    field: string;
    isCurrency?: boolean;
    isArchived?: boolean;
  }) => (
    <span
      onClick={() =>
        setEditingCell({ rowIdx, field, isArchived })
      }
      className="editable-cell"
    >
      {isCurrency ? '₹' : ''}{String(value)}
    </span>
  );

  const EditableCellInput = ({
    value,
    rowIdx,
    field,
    isArchived = false,
  }: {
    value: string | number;
    rowIdx: number;
    field: string;
    isArchived?: boolean;
  }) => (
    <input
      autoFocus
      type="text"
      defaultValue={value}
      onChange={(e) => {
        handleCellChange(rowIdx, field, e.target.value, isArchived);
      }}
      onBlur={() => setEditingCell(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setEditingCell(null);
      }}
    />
  );

  return (
    <section id="insurance" className="active" className="active">
      <h2 className="title">Insurance Policies</h2>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${tab === 'active' ? 'active' : ''}`}
          onClick={() => setTab('active')}
        >
          Active ({state.insuranceRows.length})
        </button>
        <button
          className={`tab-btn ${tab === 'archived' ? 'active' : ''}`}
          onClick={() => setTab('archived')}
        >
          Archived ({state.archivedInsuranceRows.length})
        </button>
      </div>

      {/* Active Policies */}
      {tab === 'active' && (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Policy No</th>
                  <th>Insured</th>
                  <th>Sum Assured</th>
                  <th>Premium</th>
                  <th>End Date</th>
                  <th>Pending Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.insuranceRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'policyNo' &&
                      !editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.policyNo}
                          rowIdx={idx}
                          field="policyNo"
                        />
                      ) : (
                        <EditableCell
                          value={row.policyNo}
                          rowIdx={idx}
                          field="policyNo"
                        />
                      )}
                    </td>
                    <td>
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'insured' &&
                      !editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.insured}
                          rowIdx={idx}
                          field="insured"
                        />
                      ) : (
                        <EditableCell
                          value={row.insured}
                          rowIdx={idx}
                          field="insured"
                        />
                      )}
                    </td>
                    <td className="numeric">
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'sumAssured' &&
                      !editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.sumAssured}
                          rowIdx={idx}
                          field="sumAssured"
                        />
                      ) : (
                        <EditableCell
                          value={formatCurrency(row.sumAssured)}
                          rowIdx={idx}
                          field="sumAssured"
                          isCurrency
                        />
                      )}
                    </td>
                    <td className="numeric">
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'premium' &&
                      !editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.premium}
                          rowIdx={idx}
                          field="premium"
                        />
                      ) : (
                        <EditableCell
                          value={formatCurrency(row.premium)}
                          rowIdx={idx}
                          field="premium"
                          isCurrency
                        />
                      )}
                    </td>
                    <td>
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'endDate' &&
                      !editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.endDate}
                          rowIdx={idx}
                          field="endDate"
                        />
                      ) : (
                        <EditableCell
                          value={row.endDate}
                          rowIdx={idx}
                          field="endDate"
                        />
                      )}
                    </td>
                    <td className="numeric">
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'pendingAmount' &&
                      !editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.pendingAmount}
                          rowIdx={idx}
                          field="pendingAmount"
                        />
                      ) : (
                        <EditableCell
                          value={formatCurrency(row.pendingAmount)}
                          rowIdx={idx}
                          field="pendingAmount"
                          isCurrency
                        />
                      )}
                    </td>
                    <td className="actions">
                      <button
                        className="btn small ghost danger"
                        onClick={() => handleRemoveRow(idx)}
                        title="Delete policy"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {state.insuranceRows.length === 0 && (
            <div className="empty-state">No active insurance policies</div>
          )}
        </>
      )}

      {/* Archived Policies */}
      {tab === 'archived' && (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Policy No</th>
                  <th>Insured</th>
                  <th>Sum Assured</th>
                  <th>Premium</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.archivedInsuranceRows.map((row, idx) => (
                  <tr key={idx} className="archived">
                    <td>
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'policyNo' &&
                      editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.policyNo}
                          rowIdx={idx}
                          field="policyNo"
                          isArchived
                        />
                      ) : (
                        <EditableCell
                          value={row.policyNo}
                          rowIdx={idx}
                          field="policyNo"
                          isArchived
                        />
                      )}
                    </td>
                    <td>
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'insured' &&
                      editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.insured}
                          rowIdx={idx}
                          field="insured"
                          isArchived
                        />
                      ) : (
                        <EditableCell
                          value={row.insured}
                          rowIdx={idx}
                          field="insured"
                          isArchived
                        />
                      )}
                    </td>
                    <td className="numeric">
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'sumAssured' &&
                      editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.sumAssured}
                          rowIdx={idx}
                          field="sumAssured"
                          isArchived
                        />
                      ) : (
                        <EditableCell
                          value={formatCurrency(row.sumAssured)}
                          rowIdx={idx}
                          field="sumAssured"
                          isArchived
                          isCurrency
                        />
                      )}
                    </td>
                    <td className="numeric">
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'premium' &&
                      editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.premium}
                          rowIdx={idx}
                          field="premium"
                          isArchived
                        />
                      ) : (
                        <EditableCell
                          value={formatCurrency(row.premium)}
                          rowIdx={idx}
                          field="premium"
                          isArchived
                          isCurrency
                        />
                      )}
                    </td>
                    <td>
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'endDate' &&
                      editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.endDate}
                          rowIdx={idx}
                          field="endDate"
                          isArchived
                        />
                      ) : (
                        <EditableCell
                          value={row.endDate}
                          rowIdx={idx}
                          field="endDate"
                          isArchived
                        />
                      )}
                    </td>
                    <td>
                      {editingCell?.rowIdx === idx &&
                      editingCell.field === 'status' &&
                      editingCell.isArchived ? (
                        <EditableCellInput
                          value={row.status}
                          rowIdx={idx}
                          field="status"
                          isArchived
                        />
                      ) : (
                        <EditableCell
                          value={row.status}
                          rowIdx={idx}
                          field="status"
                          isArchived
                        />
                      )}
                    </td>
                    <td className="actions">
                      <button
                        className="btn small ghost danger"
                        onClick={() => handleRemoveRow(idx)}
                        title="Delete policy"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {state.archivedInsuranceRows.length === 0 && (
            <div className="empty-state">No archived insurance policies</div>
          )}
        </>
      )}

      <div className="button-group" style={{ marginTop: '16px' }}>
        <button className="btn" onClick={handleAddRow}>
          + Add Policy
        </button>
      </div>
    </section>
  );
}
