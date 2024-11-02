import { getEncoding, Tiktoken, TiktokenEncoding } from "js-tiktoken";
import { Message } from "@/types/Message";
import { parseMessageContent } from "./message";

export const countTokens = (text: string, encoder: Tiktoken): number => {
  return encoder.encode(text).length;
};

const encoder = getEncoding(
  (process.env.TOKENIZER_MODEL as TiktokenEncoding) || "cl100k_base"
);

export const trimTextByMaxTokens = async (
  text: string,
  maxTokens: number
): Promise<string> => {
  if (maxTokens === -1) {
    return text;
  }

  const encoded = encoder.encode(text);

  if (encoded.length <= maxTokens) {
    return text;
  }

  // トークン数を指定の長さまで切り詰める
  const trimmedEncoded = encoded.slice(0, maxTokens);
  const decoded = encoder.decode(trimmedEncoded);

  return decoded;
};

export const trimMessageHistory = async (
  messages: Message[],
  maxTokens: number
): Promise<Message[]> => {
  if (maxTokens === -1) {
    return messages;
  }

  let totalTokens = 0;
  const trimmedMessages = [];

  // 最新のメッセージから順に処理
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = countTokens(
      parseMessageContent(message.content) || "",
      encoder
    );

    if (totalTokens + messageTokens <= maxTokens) {
      trimmedMessages.unshift(message);
      totalTokens += messageTokens;
    } else {
      break;
    }
  }

  // 少なくとも1つのメッセージは残す
  if (!trimmedMessages.length) {
    return [messages[messages.length - 1]];
  }
  return trimmedMessages;
};
