import { ChatCompletionContentPart } from "openai/resources";
import { v4 as uuidv4 } from "uuid";

export const generateUUIDForMessage = () => {
  return uuidv4().replace(/-/gi, "");
};

export const parseMessageContent = (
  content: string | ChatCompletionContentPart[] | null | undefined
): string | null | undefined => {
  if (Array.isArray(content)) {
    return content.join("");
  } else {
    return content;
  }
};
