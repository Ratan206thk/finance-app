/**
 * Persistence Service
 * Handles localStorage sync and dirty-state tracking
 */

import { AppState } from '../types';

const STORAGE_KEY = 'ratnakar_finance_app_v2';

let lastSavedSnapshot = '';

export function saveStateLocally(state: AppState): void {
  try {
    const snapshot = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, snapshot);
    lastSavedSnapshot = snapshot;
  } catch (e) {
    console.error('localStorage save failed', e);
  }
}

export function loadStateLocally(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch (e) {
    console.error('localStorage load failed', e);
    return null;
  }
}

export function isDirty(currentState: AppState): boolean {
  const currentSnapshot = JSON.stringify(currentState);
  return currentSnapshot !== lastSavedSnapshot;
}

export function markAsSaved(state: AppState): void {
  lastSavedSnapshot = JSON.stringify(state);
}

export function exportData(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finance-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data as AppState);
      } catch (err) {
        reject(new Error('Invalid backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
