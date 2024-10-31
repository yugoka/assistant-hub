export type ToolCall = {
  id: string;
  tool_id: string;
  tool_call_id: string;
  context_embedding: number[];
  execution_time: number;
  created_at: string;
};
