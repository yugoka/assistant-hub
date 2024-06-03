export type Thread = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  credential: string;
  auth_type: "none" | "Bearer" | "Basic";
  exection_count: number;
  average_execution_time: number;
  success_count: number;
};
