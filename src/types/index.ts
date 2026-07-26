// ===== Core Data Structures =====

export interface RSURow {
  date: string;
  shares: number;
  cash: number;
}

export interface SIPRow {
  name: string;
  cat: 'Small Cap' | 'Flexi Cap' | 'Large Cap' | 'Debt' | 'Other';
  sip: number;
  val: number;
}

export interface AccountRow {
  name: string;
  currency: 'INR' | 'NPR';
  amount: number;
}

export interface LedgerRow {
  month: string;
  bonus: number;
  earning: number;
  personalExp: number;
  familyExp: number;
  investRent: number;
  pfNpsEtc: number;
  saving: number;
}

export interface SalaryVariationRow {
  month: string;
  salary: number;
}

export interface LendenRow {
  person: string;
  amount: number;
}

export interface InsuranceRow {
  policyNo: string;
  insured: string;
  sumAssured: number;
  premium: number;
  endDate: string;
  pendingAmount: number;
}

export interface ArchivedInsuranceRow {
  policyNo: string;
  insured: string;
  sumAssured: number;
  premium: number;
  endDate: string;
  status: string;
}

// ===== Income Calculations =====

export interface IncomeCalculations {
  ctc: number;
  basic: number;
  erPf: number;
  erNps: number;
  bonus: number;
  equityIncome: number;
  totalTax: number;
  inHand: number;
  taxableIncome: number;
}

export interface TaxInfo {
  taxableIncome: number;
  taxPreCess: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
  marginalSlab: string;
}

// ===== Application State =====

export interface AppState {
  // Income & Tax
  in_ctc: number;
  in_basicPct: number;
  in_bonusPct: number;
  in_empPfPct: number;
  in_erPfPct: number;
  in_erNpsPct: number;
  in_stdDed: number;
  in_pfNpsBalance: number;
  in_rsuThisFy: number;
  in_cashAwardThisFy: number;
  in_espp: number;

  // RSU & ESPP
  in_sharePrice: number;
  in_usdInr: number;
  in_vestTaxRate: number;

  // Cash Buckets
  in_icCash: number;
  in_ncCashNpr: number;
  in_npr_peg: number;
  in_shieldMonths: number;
  in_comfortEmi: number;
  in_essentialCosts: number;

  // House Goal
  in_targetYear: number;
  in_emiPct: number;
  in_loanRate: number;
  in_loanTenure: number;
  in_downPct: number;

  // Projection
  in_equityReturn: number;
  in_pfReturn: number;
  in_years: number;

  // Tables
  rsuRows: RSURow[];
  sipRows: SIPRow[];
  accountsRows: AccountRow[];
  ledgerRows: LedgerRow[];
  salaryVariationRows: SalaryVariationRow[];
  lendenRows: LendenRow[];
  insuranceRows: InsuranceRow[];
  archivedInsuranceRows: ArchivedInsuranceRow[];
}

// ===== UI State =====

export interface TabState {
  activeTab: string;
}

// ===== Audit & History =====

export interface AuditEntry {
  timestamp: string;
  tableName: string;
  index: number;
  field: string;
  oldValue: any;
  newValue: any;
  change: string;
}

// ===== Compositions =====

export interface CashBreakdown {
  ic: number;
  ncInr: number;
  total: number;
}

export interface NetWorthComposition {
  cash: number;
  mf: number;
  rsu: number;
  pfNps: number;
  total: number;
}

export interface ProjectionData {
  year: number;
  mf: number;
  pfNps: number;
  cash: number;
  total: number;
}
