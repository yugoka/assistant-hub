import { ChatCompletionContentPart } from "openai/resources";
import { Message } from "postcss";
import { v4 as uuidv4 } from "uuid";

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
export const processMessagesForLM = (messages: Message[]) => {
  let result = "";

  for (const message of messages) {
    result += `
${message.role}:
${parseMessageContent(message.content)}}
`;
  }
  return result;
};
