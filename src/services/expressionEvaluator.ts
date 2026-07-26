/**
 * Expression Evaluator Service
 * Safely evaluates mathematical expressions like "20000+5000" or "68000/4"
 * Used throughout the app for live formula evaluation
 */

export function evalExpr(str: string | null | undefined): number {
  if (str === null || str === undefined) return 0;
  const s = String(str).trim();
  if (s === '') return 0;

  // Only allow digits, ., +, -, *, /, (, ), %, and whitespace
  if (!/^[0-9+\-*/(). %\s]+$/.test(s)) {
    const plain = parseFloat(s);
    return isNaN(plain) ? 0 : plain;
  }

  try {
    const safe = s.replace(/%/g, '/100');
    const result = new Function('"use strict"; return (' + safe + ')')();
    return typeof result === 'number' && isFinite(result) ? result : 0;
  } catch (e) {
    const plain = parseFloat(s);
    return isNaN(plain) ? 0 : plain;
  }
}

export function exprVal(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  return evalExpr(String(value));
}
