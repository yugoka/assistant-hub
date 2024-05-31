import { Message } from "../Message";

export type AssistantAPIParam = {
  threadID: string;
  messages: Message[];
  save?: boolean;
  page?: number;
  pageSize?: number;
};
