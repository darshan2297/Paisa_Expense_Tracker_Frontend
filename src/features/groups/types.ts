export type GroupExpense = {
  id: string;
  label: string;
  payer: string;
  amount: string;
  date: string;
  split_type: string;
  splits: Record<string, unknown>[];
};

export type GroupSettlement = {
  id: string;
  from_member: string;
  to_member: string;
  amount: string;
  date: string;
};

export type Group = {
  id: string;
  name: string;
  kind: string;
  members: string[];
  expenses: GroupExpense[];
  settlements: GroupSettlement[];
};

export type MemberBalance = {
  member: string;
  balance: string;
};

export type GroupCreatePayload = {
  name: string;
  kind: string;
  members: string[];
};

export type GroupExpenseCreatePayload = {
  label: string;
  payer: string;
  amount: string;
  date: string;
  split_type?: string;
  splits?: Record<string, unknown>[];
};

export type GroupSettlementCreatePayload = {
  from_member: string;
  to_member: string;
  amount: string;
  date: string;
};
