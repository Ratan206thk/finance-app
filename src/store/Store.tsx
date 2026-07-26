/**
 * App Context & Store
 * Global state management using React Context
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  AppState,
  RSURow,
  SIPRow,
  AccountRow,
  LedgerRow,
  SalaryVariationRow,
  LendenRow,
  InsuranceRow,
  ArchivedInsuranceRow,
} from '../types';
import { saveStateLocally, markAsSaved, isDirty } from '../services/persistenceService';
import { recordChange } from '../services/historyService';

const defaultState: AppState = {
  // Income & Tax
  in_ctc: 2236000,
  in_basicPct: 50,
  in_bonusPct: 10,
  in_empPfPct: 12,
  in_erPfPct: 12,
  in_erNpsPct: 14,
  in_stdDed: 75000,
  in_pfNpsBalance: 1300000,
  in_rsuThisFy: 987744,
  in_cashAwardThisFy: 251739,
  in_espp: 22500,

  // RSU & ESPP
  in_sharePrice: 41.41,
  in_usdInr: 96.57,
  in_vestTaxRate: 31.2,

  // Cash Buckets
  in_icCash: 880976,
  in_ncCashNpr: 2189328,
  in_npr_peg: 1.6,
  in_shieldMonths: 12,
  in_comfortEmi: 44212,
  in_essentialCosts: 45000,

  // House Goal
  in_targetYear: 2030,
  in_emiPct: 35,
  in_loanRate: 8.5,
  in_loanTenure: 20,
  in_downPct: 20,

  // Projection
  in_equityReturn: 11,
  in_pfReturn: 8,
  in_years: 4,

  // Tables (pre-populated)
  rsuRows: [
    { date: 'Jun 2026 (vested)', shares: 103, cash: 0 },
    { date: 'Sep 2026', shares: 26, cash: 0 },
    { date: 'Dec 2026', shares: 26, cash: 0 },
    { date: 'Mar 2027', shares: 92, cash: 251739 },
    { date: 'Jun 2027', shares: 43, cash: 62935 },
    { date: 'Sep 2027', shares: 42, cash: 62935 },
    { date: 'Dec 2027', shares: 41, cash: 62935 },
    { date: 'Mar 2028', shares: 41, cash: 62935 },
    { date: 'Jun 2028', shares: 41, cash: 62935 },
    { date: 'Sep 2028', shares: 16, cash: 62935 },
    { date: 'Dec 2028', shares: 16, cash: 62935 },
    { date: 'Mar 2029', shares: 16, cash: 62935 },
  ],

  sipRows: [
    { name: 'Quant Small Cap', cat: 'Small Cap', sip: 10000, val: 99800 },
    { name: 'Nippon India Small Cap', cat: 'Small Cap', sip: 10000, val: 93297 },
    { name: 'HDFC Flexi Cap', cat: 'Flexi Cap', sip: 20000, val: 169385 },
    { name: 'Parag Parikh Flexi Cap', cat: 'Flexi Cap', sip: 8000, val: 63656 },
    { name: 'Large Cap / Index Fund', cat: 'Large Cap', sip: 20000, val: 0 },
  ],

  accountsRows: [
    { name: 'Nitya Everest', currency: 'NPR', amount: 529200 },
    { name: 'Nitya SBI (NSBL)', currency: 'NPR', amount: 1090429 },
    { name: 'Ratan SBI (NSBL)', currency: 'NPR', amount: 556082 },
    { name: 'Ratan NIC (NIC Asia)', currency: 'NPR', amount: 12438 },
    { name: 'Nepali Cash', currency: 'NPR', amount: 925 },
    { name: 'khalti', currency: 'NPR', amount: 254 },
    { name: 'FI', currency: 'INR', amount: 50000 },
    { name: 'Cash', currency: 'INR', amount: 2310 },
    { name: 'VC', currency: 'INR', amount: 3727 },
    { name: 'HDFC', currency: 'INR', amount: 720558 },
    { name: 'SBI', currency: 'INR', amount: 104381 },
  ],

  ledgerRows: [
    {
      month: 'Apr/May Y1',
      bonus: 0,
      earning: 0,
      personalExp: 10096,
      familyExp: -18000,
      investRent: 0,
      pfNpsEtc: 324,
      saving: -5420,
    },
    {
      month: 'May/Jun Y1',
      bonus: 0,
      earning: 59645,
      personalExp: 20946,
      familyExp: 0,
      investRent: 39785,
      pfNpsEtc: 5256,
      saving: -6342,
    },
    {
      month: 'Jun/Jul Y1',
      bonus: 0,
      earning: 59360,
      personalExp: 8539,
      familyExp: 19778,
      investRent: 0,
      pfNpsEtc: 5814,
      saving: 45007,
    },
    {
      month: 'Jul/Aug Y1',
      bonus: 0,
      earning: 59360,
      personalExp: 7330,
      familyExp: 45500,
      investRent: 0,
      pfNpsEtc: 5814,
      saving: 46216,
    },
    {
      month: 'Aug/Sep Y1',
      bonus: 0,
      earning: 58110,
      personalExp: 12486,
      familyExp: 36260,
      investRent: 0,
      pfNpsEtc: 5814,
      saving: 39810,
    },
    {
      month: 'Sep/Oct Y1',
      bonus: 0,
      earning: 59360,
      personalExp: 5249,
      familyExp: 67384,
      investRent: 0,
      pfNpsEtc: 5814,
      saving: 48297,
    },
    {
      month: 'Oct/Nov Y1',
      bonus: 0,
      earning: 59360,
      personalExp: 16066,
      familyExp: 77033,
      investRent: 0,
      pfNpsEtc: 5814,
      saving: 37480,
    },
    {
      month: 'Nov/Dec Y1',
      bonus: 0,
      earning: 60000,
      personalExp: 11974,
      familyExp: 111000,
      investRent: 0,
      pfNpsEtc: 5814,
      saving: 42212,
    },
    {
      month: 'Dec/Jan Y1',
      bonus: 0,
      earning: 60000,
      personalExp: 13191,
      familyExp: 4971,
      investRent: 0,
      pfNpsEtc: 5814,
      saving: 40995,
    },
    {
      month: 'Jan/Feb Y1',
      bonus: 0,
      earning: 58750,
      personalExp: 6849,
      familyExp: 11946,
      investRent: 0,
      pfNpsEtc: 5814,
      saving: 46087,
    },
    {
      month: 'Feb/Mar Y1',
      bonus: 0,
      earning: 60000,
      personalExp: 12032,
      familyExp: 8481,
      investRent: 0,
      pfNpsEtc: 7540,
      saving: 40428,
    },
    {
      month: 'Mar/Apr Y1',
      bonus: 0,
      earning: 60000,
      personalExp: 8268,
      familyExp: 43529,
      investRent: 0,
      pfNpsEtc: 5814,
      saving: 45918,
    },
    {
      month: 'Apr/May Y2',
      bonus: 0,
      earning: 58763,
      personalExp: 5159,
      familyExp: 6036,
      investRent: 0,
      pfNpsEtc: 5814,
      saving: 47790,
    },
    {
      month: 'May/Jun Y2',
      bonus: 120000,
      earning: 58763,
      personalExp: 8250,
      familyExp: 4927,
      investRent: 0,
      pfNpsEtc: 6774,
      saving: 163739,
    },
    {
      month: 'Jun/Jul Y2',
      bonus: 0,
      earning: 58763,
      personalExp: 14676,
      familyExp: 35742,
      investRent: 0,
      pfNpsEtc: 6774,
      saving: 37313,
    },
    {
      month: 'Jul/Aug Y2',
      bonus: 0,
      earning: 86770,
      personalExp: 17120,
      familyExp: 87947,
      investRent: 0,
      pfNpsEtc: 6774,
      saving: 62876,
    },
    {
      month: 'Aug/Sep Y2',
      bonus: 0,
      earning: 67513,
      personalExp: 20117,
      familyExp: 13760,
      investRent: 0,
      pfNpsEtc: 6774,
      saving: 40622,
    },
    {
      month: 'Sep/Oct Y2',
      bonus: 0,
      earning: 70000,
      personalExp: 22561,
      familyExp: 48084,
      investRent: 0,
      pfNpsEtc: 6774,
      saving: 40665,
    },
    {
      month: 'Oct/Nov Y2',
      bonus: 6000,
      earning: 76853,
      personalExp: 16404,
      familyExp: 83248,
      investRent: 0,
      pfNpsEtc: 7734,
      saving: 58715,
    },
  ],

  salaryVariationRows: [],

  lendenRows: [
    { person: 'CC (Credit Card)', amount: -43696 },
    { person: 'Mummy', amount: -359694 },
    { person: 'FI/Pathak Ji', amount: -12712 },
    { person: 'Aarya', amount: 6520 },
    { person: 'Aasif', amount: 11000 },
    { person: 'aman', amount: 4067 },
    { person: 'Madesh', amount: -16416 },
    { person: 'Chaba', amount: 14347 },
    { person: 'Bikki/Bishal/Shamikh', amount: 97462 },
    { person: 'Bipin', amount: 15625 },
    { person: 'Ranjan', amount: 10150 },
    { person: 'Collection', amount: -273347 },
    { person: 'Money to others', amount: 136235 },
  ],

  insuranceRows: [
    {
      policyNo: '207018352',
      insured: 'You (Ratnakar)',
      sumAssured: 1000000,
      premium: 64310,
      endDate: '2044-11-15',
      pendingAmount: 1157580,
    },
    {
      policyNo: '207018379',
      insured: 'Mom (Nitya)',
      sumAssured: 100000,
      premium: 10656,
      endDate: '2037-11-24',
      pendingAmount: 127872,
    },
  ],

  archivedInsuranceRows: [
    {
      policyNo: '207005401',
      insured: 'Father (Babuji)',
      sumAssured: 100000,
      premium: 4917,
      endDate: 'Matured',
      status: 'Claimed',
    },
    {
      policyNo: '207006172',
      insured: 'Father (Babuji)',
      sumAssured: 100000,
      premium: 8193,
      endDate: 'Matured',
      status: 'Claimed',
    },
    {
      policyNo: '207001336',
      insured: 'Father (Babuji)',
      sumAssured: 100000,
      premium: 4507,
      endDate: 'Matured',
      status: 'Claimed',
    },
    {
      policyNo: '203013963',
      insured: 'Father (Babuji)',
      sumAssured: 100000,
      premium: 3518,
      endDate: 'Matured',
      status: 'Claimed',
    },
    {
      policyNo: '207012892',
      insured: 'Father (Babuji)',
      sumAssured: 300000,
      premium: 38186,
      endDate: 'Matured',
      status: 'Claimed',
    },
    {
      policyNo: '207011636',
      insured: 'Father (Babuji)',
      sumAssured: 100000,
      premium: 10381,
      endDate: 'Matured',
      status: 'Claimed',
    },
    {
      policyNo: '207000046',
      insured: 'Father (Babuji)',
      sumAssured: 200000,
      premium: 9911,
      endDate: 'Matured',
      status: 'Claimed',
    },
  ],
};

interface AppContextType {
  state: AppState;
  setState: (state: AppState) => void;
  updateField: (key: keyof AppState, value: any) => void;
  updateTableRow: (
    table: keyof AppState,
    index: number,
    field: string,
    value: any
  ) => void;
  addTableRow: (table: keyof AppState, row: any) => void;
  removeTableRow: (table: keyof AppState, index: number) => void;
  isDirty: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateInternal] = useState<AppState>(defaultState);

  const setState = useCallback((newState: AppState) => {
    setStateInternal(newState);
  }, []);

  const updateField = useCallback((key: keyof AppState, value: any) => {
    setStateInternal((prev) => {
      const oldValue = prev[key];
      if (oldValue !== value) {
        recordChange('AppState', null, String(key), oldValue, value);
      }
      return {
        ...prev,
        [key]: value,
      };
    });
  }, []);

  const updateTableRow = useCallback(
    (table: keyof AppState, index: number, field: string, value: any) => {
      setStateInternal((prev) => {
        const newState = { ...prev };
        const tableData = [...(newState[table] as any[])];
        if (tableData[index]) {
          const oldValue = tableData[index][field];
          tableData[index] = { ...tableData[index], [field]: value };
          (newState[table] as any) = tableData;

          // Record this change in history
          if (oldValue !== value) {
            recordChange(String(table), index, field, oldValue, value);
          }
        }
        return newState;
      });
    },
    []
  );

  const addTableRow = useCallback((table: keyof AppState, row: any) => {
    setStateInternal((prev) => ({
      ...prev,
      [table]: [...(prev[table] as any[]), row],
    }));
  }, []);

  const removeTableRow = useCallback((table: keyof AppState, index: number) => {
    setStateInternal((prev) => ({
      ...prev,
      [table]: (prev[table] as any[]).filter((_, i) => i !== index),
    }));
  }, []);

  const isStateDirty = useCallback(() => {
    return isDirty(state);
  }, [state]);

  return (
    <AppContext.Provider
      value={{
        state,
        setState,
        updateField,
        updateTableRow,
        addTableRow,
        removeTableRow,
        isDirty: isStateDirty,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}
