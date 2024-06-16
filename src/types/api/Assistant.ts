import { Message } from "../Message";

export type AssistantAPIParam = {
  threadID: string;
  // messagesかcontentのどちらかは必須。messagesが優先される
  messages?: Message[];
  content?: string;
  save?: boolean;
  maxToolCallSteps?: number;
  model?: string;
};

export type ResponderAgentParam = AssistantAPIParam & {
  messages: Message[];
};
