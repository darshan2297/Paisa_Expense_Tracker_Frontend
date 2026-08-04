/**
 * Chip option sets for the shared modal form — ported 1:1 from the design
 * mockup's constant tables (LOAN_KINDS, ASSET_TYPES, POL_TYPES, INV_TYPES,
 * BILL_TYPES, GROUP_KINDS, DIRS, BILL_FREQS). `color` is the selected-state
 * fill (the mockup uses each row's fg color as the chip background when
 * selected, with cream text).
 */

export type KindOption = {
  id: string;
  label: string;
  color: string;
};

export const LOAN_KINDS: KindOption[] = [
  { id: 'HL', label: 'Home loan', color: '#3E6E9E' },
  { id: 'VL', label: 'Vehicle loan', color: '#5B54D6' },
  { id: 'PL', label: 'Personal loan', color: '#C2543D' },
  { id: 'EDU', label: 'Education loan', color: '#2F7D5D' },
];

export const ASSET_KINDS: KindOption[] = [
  { id: 'HOUSE', label: 'House / Property', color: '#5B54D6' },
  { id: 'CAR', label: 'Car', color: '#3E6E9E' },
  { id: 'BIKE', label: 'Bike', color: '#2F7D6E' },
  { id: 'GOLD', label: 'Gold', color: '#A2701F' },
  { id: 'JEWEL', label: 'Jewellery', color: '#A84A7C' },
  { id: 'TECH', label: 'Electronics', color: '#8A7F6E' },
  { id: 'BANK', label: 'Bank account', color: '#2F7D5D' },
  { id: 'CASH', label: 'Cash in hand', color: '#96702C' },
];

export const POLICY_KINDS: KindOption[] = [
  { id: 'TERM', label: 'Term plan', color: '#5B54D6' },
  { id: 'HLTH', label: 'Health', color: '#2F7D5D' },
  { id: 'MOTOR', label: 'Motor', color: '#3E6E9E' },
  { id: 'ACC', label: 'Accident', color: '#96702C' },
  { id: 'HOME', label: 'Home', color: '#A84A7C' },
];

export const INVEST_KINDS: KindOption[] = [
  { id: 'SIP', label: 'Mutual fund SIP', color: '#5B54D6' },
  { id: 'STK', label: 'Stocks', color: '#3E6E9E' },
  { id: 'PPF', label: 'PPF / EPF', color: '#2F7D5D' },
  { id: 'FD', label: 'Fixed deposit', color: '#96702C' },
  { id: 'GOLD', label: 'Gold', color: '#A2701F' },
  { id: 'NPS', label: 'NPS', color: '#2F7D6E' },
];

export const BILL_KINDS: KindOption[] = [
  { id: 'ELEC', label: 'Electricity', color: '#96702C' },
  { id: 'WATER', label: 'Water', color: '#3E6E9E' },
  { id: 'GAS', label: 'Gas', color: '#C2543D' },
  { id: 'NET', label: 'Internet', color: '#5B54D6' },
  { id: 'MOB', label: 'Mobile recharge', color: '#A84A7C' },
  { id: 'CC', label: 'Credit card', color: '#8A7F6E' },
  { id: 'HL', label: 'Home loan EMI', color: '#3E6E9E' },
  { id: 'CL', label: 'Car loan EMI', color: '#5B54D6' },
  { id: 'PL', label: 'Personal loan EMI', color: '#C2543D' },
  { id: 'INS', label: 'Insurance premium', color: '#2F7D5D' },
  { id: 'SIP', label: 'SIP investment', color: '#2F7D6E' },
  { id: 'RENT', label: 'Rent', color: '#A2701F' },
  { id: 'CUST', label: 'Custom bill', color: '#7C766D' },
];

export const GROUP_KINDS: KindOption[] = [
  { id: 'FAM', label: 'Family', color: '#5B54D6' },
  { id: 'FRND', label: 'Friends', color: '#3E6E9E' },
  { id: 'FLAT', label: 'Flatmates', color: '#2F7D5D' },
  { id: 'TRIP', label: 'Travel group', color: '#96702C' },
  { id: 'CUST', label: 'Custom group', color: '#7C766D' },
];

export const SPLIT_KINDS: KindOption[] = [
  { id: 'EQ', label: 'Split equally', color: '#5B54D6' },
  { id: 'PCT', label: 'Split by percentage', color: '#3E6E9E' },
  { id: 'CUST', label: 'Custom split', color: '#96702C' },
];

/** Mockup `FIXED_TYPES` — Budget & Fixed commitment kinds. */
export const FIXED_KINDS: KindOption[] = [
  { id: 'emi', label: 'EMI', color: '#5B54D6' },
  { id: 'home_loan', label: 'Home loan', color: '#3E6E9E' },
  { id: 'personal_loan', label: 'Personal loan', color: '#C2543D' },
  { id: 'subscription', label: 'Subscription', color: '#A84A7C' },
  { id: 'bill', label: 'Bill', color: '#96702C' },
];

export const BILL_FREQS: KindOption[] = [
  { id: 'weekly', label: 'Weekly', color: '#14120F' },
  { id: 'monthly', label: 'Monthly', color: '#14120F' },
  { id: 'quarterly', label: 'Quarterly', color: '#14120F' },
  { id: 'yearly', label: 'Yearly', color: '#14120F' },
];

export const POLICY_FREQS: KindOption[] = [
  { id: 'yearly', label: 'Yearly', color: '#14120F' },
  { id: 'quarterly', label: 'Quarterly', color: '#14120F' },
  { id: 'monthly', label: 'Monthly', color: '#14120F' },
];

/** Ledger modal mode tabs — the mockup's DIRS. */
export const LEDGER_DIRS = [
  { id: 'lent', label: 'I gave money' },
  { id: 'received', label: 'They returned' },
  { id: 'borrowed', label: 'I took money' },
  { id: 'repaid', label: 'I returned' },
] as const;
