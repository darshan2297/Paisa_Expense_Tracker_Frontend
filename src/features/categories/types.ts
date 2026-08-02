export type CategoryKind = 'expense' | 'income';

export type Category = {
  id: string;
  kind: CategoryKind;
  name: string;
  color: string;
  sort_order: number;
};
