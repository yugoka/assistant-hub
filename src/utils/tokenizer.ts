import { Tiktoken, TiktokenBPE } from "js-tiktoken/lite";
import { Message } from "@/types/Message";
import { parseMessageContent } from "./message";

let tiktoken: Tiktoken | null = null;

const initializeTokenizer = async (): Promise<Tiktoken> => {
  if (!tiktoken) {
    const { default: ranks } = await import("./tokenizer-ranks");
    tiktoken = new Tiktoken(ranks);
  }
  return tiktoken;
};

export const countTokens = async (text: string): Promise<number> => {
  const tokenizer = await initializeTokenizer();
  return tokenizer.encode(text).length;
};

export const trimTextByMaxTokens = async (
  text: string,
  maxTokens: number
): Promise<string> => {
  if (maxTokens === -1) {
    return text;
  }

  const tokenizer = await initializeTokenizer();
  const encoded = tokenizer.encode(text);

  if (encoded.length <= maxTokens) {
    return text;
  }

  // トークン数を指定の長さまで切り詰める
  const trimmedEncoded = encoded.slice(0, maxTokens);
  const decoded = tokenizer.decode(trimmedEncoded);

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
    const messageTokens = await countTokens(
      parseMessageContent(message.content) || ""
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

  // 最初のメッセージがtoolロールの場合は削除
  if (trimmedMessages.length > 1 && trimmedMessages[0].role === "tool") {
    trimmedMessages.shift();
  }

  return trimmedMessages;
};