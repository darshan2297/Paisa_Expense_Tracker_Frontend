/** Savings goals — from design HTML seed. */
export type MockGoal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  monthly: number;
  emergency?: boolean;
};

export const MOCK_GOALS: MockGoal[] = [
  {
    id: 'g1',
    name: 'Emergency fund',
    target: 300000,
    saved: 185000,
    monthly: 12000,
    emergency: true,
  },
  { id: 'g2', name: 'Japan trip 2027', target: 250000, saved: 62000, monthly: 9000 },
  { id: 'g3', name: 'New laptop', target: 120000, saved: 96000, monthly: 6000 },
  { id: 'g4', name: 'Home down payment', target: 1500000, saved: 420000, monthly: 20000 },
];

export type MockInvestment = {
  id: string;
  name: string;
  kind: string;
  tag: string;
  invested: number;
  current: number;
  monthly: number;
  bg: string;
  fg: string;
};

export const MOCK_INVESTMENTS: MockInvestment[] = [
  {
    id: 'i1',
    name: 'Nifty 50 Index Fund',
    kind: 'SIP',
    tag: 'SIP',
    invested: 240000,
    current: 291500,
    monthly: 10000,
    bg: '#EDE9FE',
    fg: '#5B54D6',
  },
  {
    id: 'i2',
    name: 'Flexi Cap Fund',
    kind: 'SIP',
    tag: 'SIP',
    invested: 150000,
    current: 178200,
    monthly: 7500,
    bg: '#EDE9FE',
    fg: '#5B54D6',
  },
  {
    id: 'i3',
    name: 'Public Provident Fund',
    kind: 'PPF',
    tag: 'PPF',
    invested: 320000,
    current: 351000,
    monthly: 0,
    bg: '#E2F0E9',
    fg: '#2F7D5D',
  },
  {
    id: 'i4',
    name: 'Direct equity basket',
    kind: 'STK',
    tag: 'STK',
    invested: 180000,
    current: 163400,
    monthly: 0,
    bg: '#E5EEF8',
    fg: '#3E6E9E',
  },
  {
    id: 'i5',
    name: 'Sovereign Gold Bond',
    kind: 'GOLD',
    tag: 'GLD',
    invested: 60000,
    current: 71800,
    monthly: 0,
    bg: '#FBE9D2',
    fg: '#A2701F',
  },
  {
    id: 'i6',
    name: 'Bank FD · 2027',
    kind: 'FD',
    tag: 'FD',
    invested: 200000,
    current: 214000,
    monthly: 0,
    bg: '#FAEED8',
    fg: '#96702C',
  },
];

export type MockPolicy = {
  id: string;
  name: string;
  provider: string;
  kind: string;
  tag: string;
  cover: number;
  premium: number;
  freq: string;
  due: string;
  bg: string;
  fg: string;
};

export const MOCK_POLICIES: MockPolicy[] = [
  {
    id: 'p1',
    name: 'Click2Protect Term Plan',
    provider: 'HDFC Life',
    kind: 'TERM',
    tag: 'TERM',
    cover: 10000000,
    premium: 14200,
    freq: 'Yearly',
    due: '2026-08-14',
    bg: '#EDE9FE',
    fg: '#5B54D6',
  },
  {
    id: 'p2',
    name: 'Family Health Optima',
    provider: 'Star Health',
    kind: 'HLTH',
    tag: 'HLTH',
    cover: 1000000,
    premium: 21500,
    freq: 'Yearly',
    due: '2026-11-02',
    bg: '#E2F0E9',
    fg: '#2F7D5D',
  },
  {
    id: 'p3',
    name: 'Car insurance',
    provider: 'Bajaj Allianz',
    kind: 'MOTOR',
    tag: 'MTR',
    cover: 850000,
    premium: 9400,
    freq: 'Yearly',
    due: '2026-08-06',
    bg: '#E5EEF8',
    fg: '#3E6E9E',
  },
  {
    id: 'p4',
    name: 'Personal accident cover',
    provider: 'ICICI Lombard',
    kind: 'ACC',
    tag: 'ACC',
    cover: 2500000,
    premium: 3200,
    freq: 'Yearly',
    due: '2027-01-20',
    bg: '#FAEED8',
    fg: '#96702C',
  },
];

export type MockAsset = {
  id: string;
  name: string;
  kind: string;
  tag: string;
  purchase: number;
  current: number;
  date: string;
  bg: string;
  fg: string;
};

export const MOCK_ASSETS: MockAsset[] = [
  {
    id: 'a1',
    name: '2BHK Apartment',
    kind: 'HOUSE',
    tag: 'HSG',
    purchase: 4200000,
    current: 5150000,
    date: '2023-06-18',
    bg: '#EDE9FE',
    fg: '#5B54D6',
  },
  {
    id: 'a2',
    name: 'Hyundai i20',
    kind: 'CAR',
    tag: 'CAR',
    purchase: 1150000,
    current: 890000,
    date: '2024-09-04',
    bg: '#E5EEF8',
    fg: '#3E6E9E',
  },
  {
    id: 'a3',
    name: 'Royal Enfield',
    kind: 'BIKE',
    tag: 'BIK',
    purchase: 145000,
    current: 78000,
    date: '2021-03-22',
    bg: '#E7F0EF',
    fg: '#2F7D6E',
  },
  {
    id: 'a4',
    name: 'Gold coins & bars',
    kind: 'GOLD',
    tag: 'GLD',
    purchase: 380000,
    current: 720000,
    date: '2019-11-09',
    bg: '#FBE9D2',
    fg: '#A2701F',
  },
  {
    id: 'a5',
    name: 'Family jewellery',
    kind: 'JEWEL',
    tag: 'JWL',
    purchase: 260000,
    current: 465000,
    date: '2018-02-14',
    bg: '#FAE5F0',
    fg: '#A84A7C',
  },
  {
    id: 'a6',
    name: 'Laptop, phone, camera',
    kind: 'TECH',
    tag: 'TEC',
    purchase: 210000,
    current: 120000,
    date: '2025-01-11',
    bg: '#F3EFE9',
    fg: '#8A7F6E',
  },
  {
    id: 'a7',
    name: 'HDFC Savings',
    kind: 'BANK',
    tag: 'BNK',
    purchase: 245000,
    current: 245000,
    date: '2020-04-01',
    bg: '#E2F0E9',
    fg: '#2F7D5D',
  },
  {
    id: 'a8',
    name: 'Cash in hand',
    kind: 'CASH',
    tag: 'CSH',
    purchase: 18000,
    current: 18000,
    date: '2026-08-01',
    bg: '#FAEED8',
    fg: '#96702C',
  },
];

export type MockLoan = {
  id: string;
  name: string;
  kind: string;
  tag: string;
  principal: number;
  rate: number;
  tenure: number;
  start: string;
  outstanding: number;
  emi: number;
  bg: string;
  fg: string;
};

export const MOCK_LOANS: MockLoan[] = [
  {
    id: 'ln1',
    name: 'Home loan',
    kind: 'HL',
    tag: 'HL',
    principal: 2100000,
    rate: 8.6,
    tenure: 240,
    start: '2023-06-01',
    outstanding: 1980000,
    emi: 18400,
    bg: '#E5EEF8',
    fg: '#3E6E9E',
  },
  {
    id: 'ln2',
    name: 'Car loan',
    kind: 'VL',
    tag: 'VL',
    principal: 445000,
    rate: 9.2,
    tenure: 60,
    start: '2024-09-01',
    outstanding: 320000,
    emi: 9250,
    bg: '#EDE9FE',
    fg: '#5B54D6',
  },
  {
    id: 'ln3',
    name: 'Personal loan',
    kind: 'PL',
    tag: 'PL',
    principal: 250000,
    rate: 13.5,
    tenure: 48,
    start: '2025-02-01',
    outstanding: 130000,
    emi: 6800,
    bg: '#F9E7E1',
    fg: '#C2543D',
  },
];

export type MockLedgerEntry = {
  id: string;
  person: string;
  dir: 'lent' | 'received' | 'borrowed' | 'repaid';
  amount: number;
  date: string;
  note: string;
};

export const MOCK_LEDGER: MockLedgerEntry[] = [
  {
    id: 'l1',
    person: 'Rahul Mehta',
    dir: 'lent',
    amount: 15000,
    date: '2026-07-12',
    note: 'Emergency help',
  },
  {
    id: 'l2',
    person: 'Rahul Mehta',
    dir: 'received',
    amount: 5000,
    date: '2026-08-01',
    note: 'Part payment',
  },
  {
    id: 'l3',
    person: 'Priya Shah',
    dir: 'lent',
    amount: 3200,
    date: '2026-08-03',
    note: 'Dinner split',
  },
  {
    id: 'l4',
    person: 'Amit Patel',
    dir: 'borrowed',
    amount: 8000,
    date: '2026-06-20',
    note: 'Laptop purchase',
  },
  {
    id: 'l5',
    person: 'Amit Patel',
    dir: 'repaid',
    amount: 3000,
    date: '2026-07-28',
    note: 'Installment',
  },
  {
    id: 'l6',
    person: 'Sneha Rao',
    dir: 'lent',
    amount: 1200,
    date: '2026-07-30',
    note: 'Cab share',
  },
];

export type MockMilestone = {
  id: string;
  date: string;
  title: string;
  note: string;
  amount: number;
};

export const MOCK_MILESTONES: MockMilestone[] = [
  {
    id: 'm1',
    date: '2019-07-01',
    title: 'Started first job',
    note: 'Joined as junior engineer',
    amount: 0,
  },
  {
    id: 'm2',
    date: '2019-11-09',
    title: 'First gold purchase',
    note: 'Started buying gold every Diwali',
    amount: 380000,
  },
  {
    id: 'm3',
    date: '2021-03-22',
    title: 'Bought a bike',
    note: 'Royal Enfield, paid in full',
    amount: 145000,
  },
  {
    id: 'm5',
    date: '2023-06-18',
    title: 'Bought the apartment',
    note: '2BHK with a 20-year home loan',
    amount: 4200000,
  },
  {
    id: 'm8',
    date: '2025-08-01',
    title: 'Net worth crossed ₹50 L',
    note: 'Portfolio + property together',
    amount: 5000000,
  },
];

export type MockGroup = {
  id: string;
  name: string;
  kind: string;
  tag: string;
  members: string[];
  expenses: { id: string; label: string; payer: string; amount: number; date: string }[];
  settlements: { id: string; from: string; to: string; amount: number; date: string }[];
  bg: string;
  fg: string;
};

export const MOCK_GROUPS: MockGroup[] = [
  {
    id: 'gr1',
    name: 'Flat 402',
    kind: 'FLAT',
    tag: 'FLT',
    members: ['You', 'Karan Joshi', 'Neel Shah'],
    expenses: [
      { id: 'ge1', label: 'Monthly rent', payer: 'You', amount: 36000, date: '2026-08-01' },
      { id: 'ge2', label: 'Electricity', payer: 'Karan Joshi', amount: 3400, date: '2026-08-03' },
      { id: 'ge3', label: 'Groceries run', payer: 'Neel Shah', amount: 5200, date: '2026-08-06' },
    ],
    settlements: [{ id: 'gs1', from: 'Karan Joshi', to: 'You', amount: 8000, date: '2026-07-30' }],
    bg: '#E2F0E9',
    fg: '#2F7D5D',
  },
  {
    id: 'gr2',
    name: 'Goa trip',
    kind: 'TRIP',
    tag: 'TRP',
    members: ['You', 'Priya Shah', 'Rahul Mehta', 'Sneha Rao'],
    expenses: [
      { id: 'ge5', label: 'Flights', payer: 'You', amount: 32000, date: '2026-07-18' },
      {
        id: 'ge6',
        label: 'Villa booking',
        payer: 'Rahul Mehta',
        amount: 44000,
        date: '2026-07-19',
      },
    ],
    settlements: [{ id: 'gs2', from: 'Sneha Rao', to: 'You', amount: 11000, date: '2026-07-28' }],
    bg: '#FAEED8',
    fg: '#96702C',
  },
];
