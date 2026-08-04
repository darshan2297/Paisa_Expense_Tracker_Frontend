export type Milestone = {
  id: string;
  date: string;
  title: string;
  note: string | null;
  amount: string;
};

export type MilestoneCreatePayload = {
  date: string;
  title: string;
  note?: string | null;
  amount?: string;
};

export type MilestoneUpdatePayload = Partial<MilestoneCreatePayload>;
