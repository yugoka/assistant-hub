export type Thread = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  enable_memory: boolean;
  memory: string;
  maximum_memory_tokens: number;
  system_prompt: string;
  starred: boolean;
  maximum_input_tokens: number;
  model_name: string;
};
