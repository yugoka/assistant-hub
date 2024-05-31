import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources";

export type Message = ChatCompletionMessageParam & {
  id: string;
  created_at?: Date;
  thread_id: string;
};

export type MessageChunk = ChatCompletionChunk.Choice.Delta & {
  id: string;
};
