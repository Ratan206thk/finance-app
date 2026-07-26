/**
 * History & Audit Trail Service
 * Tracks all changes to numeric fields with timestamps
 * Stores expressions as-is, evaluates on display
 */

import { AuditEntry } from '../types';

const HISTORY_KEY = 'ratnakar_finance_app_history_v2';

/**
 * Record a change to a field
 */
export function recordChange(
  tableName: string,
  index: number | null,
  field: string,
  oldValue: any,
  newValue: any
): AuditEntry {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    tableName,
    index: index ?? -1,
    field,
    oldValue,
    newValue,
    change: `${oldValue} → ${newValue}`,
  };

  try {
    const history = getHistory();
    history.push(entry);

    // Keep only last 10000 entries across all fields
    if (history.length > 10000) {
      history.splice(0, history.length - 10000);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('History save failed', e);
  }

  return entry;
}

/**
 * Get all history entries
 */
export function getHistory(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('History load failed', e);
    return [];
  }
}

/**
 * Get history for a specific field
 */
export function getFieldHistory(
  tableName: string,
  field: string,
  index?: number
): AuditEntry[] {
  const history = getHistory();
  return history.filter((entry) => {
    const tableMatch = entry.tableName === tableName;
    const fieldMatch = entry.field === field;
    const indexMatch = index !== undefined ? entry.index === index : true;
    return tableMatch && fieldMatch && indexMatch;
  });
}

/**
 * Get last N changes
 */
export function getRecentChanges(limit: number = 50): AuditEntry[] {
  const history = getHistory();
  return history.slice(-limit);
}

/**
 * Clear history
 */
export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Export history as CSV
 */
export function exportHistoryAsCSV(): void {
  const history = getHistory();
  const headers = ['Timestamp', 'Table', 'Index', 'Field', 'Old Value', 'New Value'];
  const rows = history.map((entry) => [
    entry.timestamp,
    entry.tableName,
    entry.index.toString(),
    entry.field,
    String(entry.oldValue),
    String(entry.newValue),
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finance-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
