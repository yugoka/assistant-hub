import { ChatCompletionMessageParam } from "openai/resources";

export type AssistantAPIParam = {
  threadID: string;
  messages: ChatCompletionMessageParam[];
  save?: boolean;
};
