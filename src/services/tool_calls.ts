import { Message } from "@/types/Message";
import { ToolCall } from "@/types/ToolCall";
import { stringfyMessagesForLM } from "@/utils/message";
import { createClient } from "@/utils/supabase/server";
import { getEmbedding } from "./embeddings";

// ==============
// ToolCall作成
// ==============
export interface CreateToolCallInput {
  tool_id: string;
  tool_call_id: string;
  execution_time?: number;
  contextMessages: Message[];
}
export const createToolCall = async ({
  tool_call_id,
  tool_id,
  execution_time,
  contextMessages,
}: CreateToolCallInput): Promise<ToolCall> => {
  const contextText = stringfyMessagesForLM(contextMessages);
  const contextEmbedding = await getEmbedding(contextText);

  const supabase = createClient();

  const { data, error } = await supabase
    .from("tool_calls")
    .insert([
      {
        tool_call_id,
        tool_id,
        execution_time,
        context_embedding: contextEmbedding,
      },
    ])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};
