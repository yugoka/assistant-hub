export const authTypes: [string, ...string[]] = ["None", "Bearer", "Basic"];
export type AuthType = (typeof authTypes)[number];

export type Tool = {
  id: string;
  name: string;
  description: string;
  schema: string;
  auth_type: (typeof authTypes)[number];
  user_id: string;
  credential: string;
  exection_count: number;
  average_execution_time: number;
  success_count: number;
  created_at: string;
};
