import { init, Tiktoken } from "tiktoken/lite/init";
import cl100k_base from "tiktoken/encoders/cl100k_base";
// @ts-expect-error
import wasm from "tiktoken/lite/tiktoken_bg.wasm?module";
import { parseMessageContent } from "./message";
import { Message } from "@/types/Message";

export const countTokens = (text: string, encoder: Tiktoken) => {
  return encoder.encode(text).length;
};

export const trimMessageHistory = async (
  messages: Message[],
  maxTokens: number
): Promise<Message[]> => {
  if (maxTokens === -1) {
    return messages;
  }

  await init((imports) => WebAssembly.instantiate(wasm, imports));

  const encoder = new Tiktoken(
    cl100k_base.bpe_ranks,
    cl100k_base.special_tokens,
    cl100k_base.pat_str
  );

  let totalTokens = 0;
  const trimmedMessages = [];

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

  if (!trimmedMessages.length) {
    return [messages[trimmedMessages.length - 1]];
  }
  return trimmedMessages;
};
