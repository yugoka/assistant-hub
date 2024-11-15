import { Message } from "../Message";

export type AssistantAPIParam = {
  threadID: string;
  // messagesかcontentのどちらかは必須。messagesが優先される
  messages?: Message[];
  content?: string;
  save?: boolean;
  maxSteps?: number;
  model?: string;
  stream?: boolean;
};

export type ResponderAgentParam = AssistantAPIParam & {
  messages: Message[];
};
