export type Asset = {
  id: string;
  name: string;
  kind: string;
  purchase_value: string;
  current_value: string;
  acquired_on: string | null;
};

export type AssetsSummary = {
  total_value: string;
  purchase_total: string;
  gain: string;
  count: number;
  assets: Asset[];
};

export type AssetCreatePayload = {
  name: string;
  kind: string;
  purchase_value: string;
  current_value: string;
  acquired_on?: string | null;
};
