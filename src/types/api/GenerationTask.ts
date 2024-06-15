import { ChatCompletionMessageParam } from "openai/resources";

export type GenerationTaskAPIParams = {
  messages: ChatCompletionMessageParam[];
  model?: string;
};
