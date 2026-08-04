export type Profile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  occupation: string | null;
  currency: string;
  month_start_day: number;
  dark_mode: boolean;
  week_start_monday: boolean;
  round_up_savings: boolean;
  digest_enabled: boolean;
  sound_enabled: boolean;
  created_at: string;
};

/** All fields optional - PATCH semantics, matches the backend's ProfileUpdateRequest. */
export type ProfileUpdatePayload = Partial<
  Omit<Profile, 'id' | 'email' | 'created_at' | 'month_start_day'> & { month_start_day: number }
>;
