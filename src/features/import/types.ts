export type ImportRow = {
  id: string;
  date: string;
  merchant: string;
  amount: string;
  suggested_category_id: string | null;
  state: string;
  duplicate_of_txn_id: string | null;
};

export type ImportPreview = {
  job_id: string;
  filename: string;
  status: string;
  rows: ImportRow[];
};

export type ImportRowUpdatePayload = {
  suggested_category_id?: string | null;
  state?: 'ready' | 'duplicate' | 'ignored';
};

export type ImportConfirmResult = {
  created_count: number;
  skipped_count: number;
};
