import { Tiktoken, TiktokenBPE } from "js-tiktoken/lite";
import { Message } from "@/types/Message";
import { parseMessageContent } from "./message";

let ranksCache: TiktokenBPE | null = null;

const loadRanks = async (): Promise<TiktokenBPE> => {
  if (!ranksCache) {
    const { default: ranks } = await import("./tokenizer-ranks");
    ranksCache = ranks;
  }
  return ranksCache;
};

const initializeTokenizer = async () => {
  const ranks = await loadRanks();
  return new Tiktoken(ranks);
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

  const tokenizer = await initializeTokenizer();

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
  return trimmedMessages;
};
