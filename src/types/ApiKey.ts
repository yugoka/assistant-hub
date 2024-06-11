export type ApikeyMode = "read" | "write" | "all";

export type Apikey = {
  id: number;
  user_id: string;
  name: string;
  mode: ApikeyMode;
  hashedKey?: string;
};
