export type SecuritySettings = {
  pin_lock_enabled: boolean;
  fingerprint_login_enabled: boolean;
  face_id_enabled: boolean;
  password_protection_enabled: boolean;
  hide_sensitive_amounts: boolean;
  privacy_mode_enabled: boolean;
  auto_lock_enabled: boolean;
  cloud_backup_enabled: boolean;
  local_backup_enabled: boolean;
  e2e_encryption_enabled: boolean;
  two_factor_enabled: boolean;
  auto_logout_minutes: number;
  vault_locked: boolean;
};

export type SecuritySettingsUpdatePayload = Partial<SecuritySettings>;

export type BackupStatus = {
  last_backup_at: string | null;
  last_backup_size_bytes: number | null;
  encrypted: boolean;
};

export type UserSession = {
  id: string;
  device_label: string;
  location: string | null;
  ip: string | null;
  user_agent: string | null;
  last_active_at: string;
  is_current: boolean;
};

export type SecurityEvent = {
  id: string;
  event_type: string;
  device_label: string;
  detail: string | null;
  created_at: string;
};

export type LoginHistoryListResponse = {
  data: SecurityEvent[];
  total: number;
  page: number;
  size: number;
  pages: number;
  from_date: string | null;
  to_date: string | null;
};

export type LoginHistoryFilters = {
  page: number;
  size: number;
  from_date: string;
  to_date: string;
};

export type SecurityOverview = {
  settings: SecuritySettings;
  backup: BackupStatus;
  sessions: UserSession[];
  login_history: SecurityEvent[];
};

export type ProfileConfig = {
  auto_logout_minutes_options: number[];
  month_start_day_min: number;
  month_start_day_max: number;
  currencies: string[];
};
