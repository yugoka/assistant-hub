import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionChunk,
  ChatCompletionMessageToolCall,
  ChatCompletionSystemMessageParam,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";

export type MessageForDB = {
  id: string;
  thread_id: string;
  role: "assistant" | "system" | "user" | "tool";
  content?: string;
  // stringfyしたオブジェクトとして保存
  tool_calls?: string;
  tool_call_id?: string;
  name?: string;
  created_at?: string;
};

export type SystemMessage = ChatCompletionSystemMessageParam & {
  id: string;
  created_at?: string;
  thread_id: string;
};
export type UserMessage = ChatCompletionUserMessageParam & {
  id: string;
  created_at?: string;
  thread_id: string;
};

export type CustomToolCall = {
  operationId?: string;
  method?: string;
  path?: string;
  baseToolName?: string;
} & ChatCompletionMessageToolCall;

export type AssistantMessage = ChatCompletionAssistantMessageParam & {
  id: string;
  created_at?: string;
  thread_id: string;
  tool_calls?: CustomToolCall[];
};

export type ToolMessage = ChatCompletionToolMessageParam & {
  id: string;
  created_at?: string;
  thread_id: string;
};

export type Message =
  | SystemMessage
  | UserMessage
  | AssistantMessage
  | ToolMessage;

export type MessageChunk = ChatCompletionChunk.Choice.Delta & {
  id: string;
};
