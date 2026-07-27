import { describe, it, expect } from 'vitest';
import { evalExpr } from './expressionEvaluator';

describe('Expression Evaluator', () => {
  it('evaluates simple arithmetic', () => {
    expect(evalExpr('2+3')).toBe(5);
    expect(evalExpr('10-5')).toBe(5);
    expect(evalExpr('4*5')).toBe(20);
    expect(evalExpr('20/4')).toBe(5);
  });

  it('handles complex expressions', () => {
    expect(evalExpr('2+3*5')).toBe(17);
    expect(evalExpr('(2+3)*5')).toBe(25);
    expect(evalExpr('100*1.2')).toBe(120);
  });

  it('handles edge cases', () => {
    expect(evalExpr('')).toBe(0);
    expect(evalExpr(null)).toBe(0);
    expect(evalExpr(undefined)).toBe(0);
    expect(evalExpr('invalid')).toBe(0);
  });

  it('converts numbers correctly', () => {
    expect(evalExpr(100)).toBe(100);
    expect(evalExpr(0)).toBe(0);
    expect(evalExpr(-50)).toBe(-50);
  });

  it('prevents injection attacks', () => {
    expect(evalExpr('alert("test")')).toBe(0);
    expect(evalExpr('console.log("test")')).toBe(0);
  });
});
