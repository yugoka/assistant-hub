export type Tool = {
  id: string;
  name: string;
  description: string;
  schema: string;
  auth_type: "None" | "Bearer" | "Basic";
  user_id: string;
  credential: string;
  exection_count: number;
  average_execution_time: number;
  success_count: number;
  created_at: string;
};
