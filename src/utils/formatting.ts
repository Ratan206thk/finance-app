/**
 * Formatting Utilities
 */

export function fmt(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function fmtSigned(n: number): string {
  return (n < 0 ? '-' : '') + '₹' + Math.round(Math.abs(n)).toLocaleString('en-IN');
}

export function fmtPct(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
}

export function fmtRawNumber(n: number): string {
  return Math.round(n).toLocaleString('en-IN');
}
