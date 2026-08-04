export type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  read_at: string | null;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
};
