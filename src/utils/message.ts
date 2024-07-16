import { Message } from "@/types/Message";
import { ChatCompletionContentPart } from "openai/resources";
import { encoding_for_model, TiktokenModel } from "tiktoken";

export const parseMessageContent = (
  content: string | ChatCompletionContentPart[] | null | undefined
): string | null | undefined => {
  if (Array.isArray(content)) {
    return content.join("");
  } else {
    return content;
  }
};

// messagesの配列(json)を自然言語モデルが認識しやすい形に変形
export const stringfyMessagesForLM = (messages: Message[]): string => {
  let result = "";

  for (const message of messages) {
    result += `
${message.role}:
${parseMessageContent(message.content)}}
`;
  }
  return result;
};

export const countTokens = (text: string, model: TiktokenModel = "gpt-4o") => {
  const encoder = encoding_for_model(model);
  return encoder.encode(text).length;
};

export const trimMessageHistory = (
  messages: Message[],
  maxTokens: number,
  model?: TiktokenModel
): Message[] => {
  if (maxTokens === -1) {
    return messages;
  }

  let totalTokens = 0;
  const trimmedMessages = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = countTokens(
      parseMessageContent(message.content) || "",
      model
    );

    if (totalTokens + messageTokens <= maxTokens) {
      trimmedMessages.unshift(message);
      totalTokens += messageTokens;
    } else {
      break;
    }
  }

  return trimmedMessages;
};
