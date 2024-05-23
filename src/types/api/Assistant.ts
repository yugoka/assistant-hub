import { ChatCompletionMessageParam } from "openai/resources";

export type AssistantAPIParam = {
  messages: ChatCompletionMessageParam[];
};
