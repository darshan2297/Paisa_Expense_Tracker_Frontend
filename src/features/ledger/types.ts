export type LedgerEntry = {
  id: string;
  person_name: string;
  direction: string;
  amount: string;
  date: string;
  note: string | null;
};

export type PersonBalance = {
  person_name: string;
  net_balance: string;
};

export type LedgerEntryCreatePayload = {
  person_name: string;
  direction: string;
  amount: string;
  date: string;
  note?: string | null;
};

export type LedgerEntryUpdatePayload = Partial<LedgerEntryCreatePayload>;
