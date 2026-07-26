# Excel to App Migration Guide

## 📊 Data Mapping Overview

Your Excel tracker has **7 sheets** with extensive financial data. Here's how to migrate to the app:

---

## 1️⃣ **Expenses Sheet → Monthly Ledger Tab**

### What maps directly:
| Excel Column | App Tab | Field |
|---|---|---|
| Month | Ledger | Month |
| Earning (Column E) | Ledger | Earning |
| Bonus (Column D) | Ledger | Bonus |
| personal expense (Col F) | Ledger | Personal Exp |
| Family Expense (Col H) | Ledger | Family Exp |
| Home rent/Invest (Col I) | Ledger | Invest/Rent |
| PF+NPS+APY+ESPP (Col J) | Ledger | PF+NPS+etc |
| Saving (Col L) | Ledger | Saving |

### Action needed:
✅ **Copy 19 months** from Expenses sheet (April/May Y1 → Oct/Nov Y2) to Monthly Ledger tab
- Formulas in Excel won't transfer; use VALUES ONLY
- App will auto-calculate based on your entries

---

## 2️⃣ **LENDEN (Expenses Sheet, Cols N-O) → Lenden Tab**

### What maps:
| Excel | App |
|---|---|
| Names (CC, Mummy, FI/Pathak Ji, Aarya, etc.) | Person/Item |
| Amounts (negative = owed by you, positive = owed to you) | Amount (₹) |

### Action needed:
✅ **Extract 13 entries** from your Lenden column (rows 12-24)
- App auto-badges as "You owe" or "Owed to you"

---

## 3️⃣ **CASH Accounts (Expenses Sheet, Cols Q-R) → Accounts Tab**

### What maps:
| Account Name | Currency | Balance |
|---|---|---|
| Nitya Everest | NPR | 529,200 |
| Nitya SBI | NPR | 1,090,429 |
| Ratan SBI | NPR | 356,082 |
| Ratan NIC | NPR | 12,438 |
| Nepali Cash | NPR | 925 |
| khalti | NPR | 254 |
| FI | INR | 50,000 |
| Cash | INR | 2,310 |
| VC | INR | 3,727 |
| HDFC | INR | 720,558 |
| SBI | INR | 104,381 |

### Action needed:
✅ **All 11 accounts already in app** (pre-populated)
- App auto-syncs with Cash Buckets tab
- Update balances if they've changed since you exported

---

## 4️⃣ **Insurance (Expense Sheet, Babuji NLIC) → Insurance Tab**

### Active Personal Policies (Expenses sheet, rows 1-2):
| Policy No | Insured | Sum Assured | Premium | End Date | Pending |
|---|---|---|---|---|---|
| 207018352 | You (Ratnakar) | ₹1,000,000 | ₹64,310 | 2044-11-15 | ₹1,157,580 |
| 207018379 | Mom (Nitya) | ₹100,000 | ₹10,656 | 2037-11-24 | ₹127,872 |

### Father's Policies (Babuji NLIC sheet — matured/claimed):
⚠️ **NOT in app yet** — 8 policies, all mature. Should we track these for historical records or skip?

### Action needed:
✅ **Already in app** (pre-populated for your 2 active policies)
- Update Pending amounts if claims status changed
- Optional: Add father's 8 policies as archived reference

---

## 5️⃣ **Income Sheets (24-25, 25-26, 26-27 FY) → Income & Tax Tab**

### What's captured in app:
- **CTC**: Your current CTC (shown in Income tab as "2,236,000")
- **PF/NPS deductions**: Employee 12%, Employer 12% PF + 14% NPS
- **Standard deduction**: ₹75,000 (Indian new regime)
- **Tax regime**: New regime (no old regime option in app)

### What's in Excel but NOT editable in app:
- Monthly salary breakdowns (April → March)
- Month-by-month tax paid
- RSU/equity income specific to each month
- ESPP perquisites per month

### Action needed:
⚠️ **Aggregate data for the app**:
1. **26-27 FY current data** (Apr 2026–ongoing):
   - Base Pay: ₹2,236,000 (already in app)
   - Basic %: 50% (already set)
   - Bonus %: 10% (if applicable)
   - PF/NPS %: 12% + 14% (already set)
2. **RSU this FY**: Sum vesting dates (app has 12 rows pre-filled)
3. **Cash Awards**: Check if any outside RSU vesting
4. **ESPP perquisite**: App has ₹22,500 (verify current)

---

## 6️⃣ **PF Interest Sheet → NOT in app (static value only)**

### Current state in app:
- `PF_NPS_OTHER = 1,300,000` (hardcoded, not editable)

### From your Excel:
- PF grows annually at 8.15–8.25% (tracked in PF Interest sheet)
- Your PF balance today is approximately in the ₹1.3M range

### Action needed:
⚠️ **Manually update if needed**:
- If your actual PF+NPS+PPF+APY total differs, edit the `PF_NPS_OTHER` value in the app code (line ~1243)
- OR: Make it an editable field (requires code change)

---

## 📋 **Missing/Non-Standard Data**

| Data | Excel Source | App Status | Action |
|---|---|---|---|
| Monthly salary variation | 25-26 FY Income | Not tracked | Use average (app assumes flat CTC) |
| Month-by-month RSU vest | 26-27 FY Income | Tracked in RSU tab | ✅ Already pre-filled |
| HRA component | 25-26 FY Income | Not tracked | Not applicable (new regime) |
| Reimbursements | All FY sheets | Not tracked | Skip (minor amounts) |
| PF interest accrual | PF Interest sheet | Static value only | Can be updated manually |

---

## 🎯 **Migration Checklist**

### Priority 1: Copy data now
- [ ] Monthly Ledger (19 months of income/expense)
- [ ] Lenden entries (13 people/items)
- [ ] Verify Accounts tab balances (11 accounts)

### Priority 2: Verify existing data
- [ ] Income & Tax inputs (CTC, PF%, NPS%, RSU this FY)
- [ ] RSU vesting schedule (12 dates pre-filled)
- [ ] Insurance policies (2 active, 8 archived)

### Priority 3: Optional enhancements
- [ ] Make PF/NPS editable instead of hardcoded
- [ ] Track father's insurance policies (historical reference)
- [ ] Import PF interest tracking (separate table)

---

## 💡 **Key Differences: Excel vs. App**

| Aspect | Excel | App |
|---|---|---|
| **Calculation model** | Month-by-month, formulas | Annual average, live expressions |
| **Tax regime** | New regime (with old regime option) | New regime only |
| **PF/NPS tracking** | Real-time balance with interest | Static annual snapshot |
| **Cloud sync** | Manual export/upload | Real-time Firestore sync |
| **Editability** | Read-only computed cells | All inputs live-editable |
| **Charts** | Static images | Real-time interactive charts |

---

## ❓ **Questions Before You Start**

1. **PF/NPS/PPF/APY balance**: Is ₹1,300,000 current or should we update?
2. **Father's insurance**: Keep the 8 policies in app as archived, or just reference?
3. **Monthly salary variation**: 24-25 FY had salary steps (80K→103K→126K). Should we average or use latest (103K)?
4. **Bonuses**: Your Excel shows April: ₹218,000 (one-time). Is this recurring?

---

## 📄 **Export as CSV (if needed)**

To export data from Excel as CSV for bulk import:
1. Select the data range
2. File → Export As → CSV
3. Import into app (if CSV import feature is added)

For now: **Manual copy-paste into app tables is faster**.

---

**Last updated**: 26 July 2026
**Migration priority**: Monthly Ledger → Income & Tax → RSU → Accounts
