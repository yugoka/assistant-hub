import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources";

export type Message = ChatCompletionMessageParam & {
  id: string;
  created_at?: Date;
};

export type MessageChunk = ChatCompletionChunk.Choice.Delta & {
  id: string;
};
