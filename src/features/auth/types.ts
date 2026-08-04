export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  /** Account already has an app PIN in the database. */
  pin_configured: boolean;
};

export type PinStatus = {
  configured: boolean;
};

export type PinSetPayload = {
  pin: string;
};

export type PinChangePayload = {
  current_pin: string;
  new_pin: string;
};

export type PinVerifyPayload = {
  pin: string;
};
