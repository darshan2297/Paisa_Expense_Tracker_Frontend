export type Policy = {
  id: string;
  name: string;
  provider: string;
  kind: string;
  cover_amount: string;
  premium: string;
  frequency: string;
  renewal_date: string;
  note: string | null;
  premium_paid: boolean;
  linked_transaction_id: string | null;
};

export type PoliciesSummary = {
  total_cover: string;
  annual_premium: string;
  policy_count: number;
  next_renewal: Policy | null;
  policies: Policy[];
};

export type PolicyCreatePayload = {
  name: string;
  provider: string;
  kind: string;
  cover_amount: string;
  premium: string;
  frequency: string;
  renewal_date: string;
  note?: string | null;
};
