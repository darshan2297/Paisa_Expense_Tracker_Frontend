export type ScanLineItem = {
  left: string;
  right: string;
};

export type ScanResult = {
  merchant: string;
  date: string;
  amount: string;
  gst: string | null;
  payment_method: string | null;
  note: string | null;
  line_items: ScanLineItem[];
  suggested_category_id: string | null;
};

export type ScanConfirmPayload = {
  merchant: string;
  date: string;
  amount: string;
  category_id: string;
  note?: string | null;
};

export type ScanConfirmResult = {
  transaction_id: string;
};
