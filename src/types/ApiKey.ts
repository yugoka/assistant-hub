export const apikeyModes: [string, ...string[]] = ["read", "write", "all"];
export type ApikeyMode = (typeof apikeyModes)[number];

export type Apikey = {
  id: number;
  user_id: string;
  name: string;
  mode: ApikeyMode;
  hashedKey?: string;
  created_at: string;
};
