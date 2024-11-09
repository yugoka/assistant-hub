export const authTypes: [string, ...string[]] = [
  "None",
  "Bearer",
  "Custom Header",
];

export type AuthType = (typeof authTypes)[number];

export type Tool = {
  id: string;
  name: string;
  description: string;
  schema: string;
  auth_type: (typeof authTypes)[number];
  user_id: string;
  credential?: string;
  execution_count: number;
  average_execution_time: number;
  success_count: number;
  instruction_examples: string[];
  created_at: string;
};

export type ToolWithSimilarity = Tool & {
  similarity: number;
};
