import { Message } from "../Message";

export type AssistantAPIParam = {
  threadID: string;
  // messagesかcontentのどちらかは必須。messagesが優先される
  messages?: Message[];
  content?: string;
  save?: boolean;
  page?: number;
  pageSize?: number;
};

export type ResponderAgentParam = AssistantAPIParam & {
  messages: Message[];
};
