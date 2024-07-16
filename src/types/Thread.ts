export type Thread = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  memory: string;
  system_prompt: string;
  protected: boolean;
  maximum_initial_input_tokens: number;
};
