import { init, Tiktoken } from "tiktoken/lite/init";
// Vercel無料プランのedge function 1MB制限のため、古いモデルを使用
// 別のedge functionsに移管する、Node.js関数に移管するなどを検討
import p50k_base from "tiktoken/encoders/p50k_base";
// @ts-expect-error
import wasm from "tiktoken/lite/tiktoken_bg.wasm?module";
import { parseMessageContent } from "./message";
import { Message } from "@/types/Message";

export const countTokens = (text: string, encoder: Tiktoken) => {
  return encoder.encode(text).length;
};

export const initializeEncoder = async (): Promise<Tiktoken> => {
  await init((imports) => WebAssembly.instantiate(wasm, imports));
  return new Tiktoken(
    p50k_base.bpe_ranks,
    p50k_base.special_tokens,
    p50k_base.pat_str
  );
};

export const trimTextByMaxTokens = async (
  text: string,
  maxTokens: number
): Promise<string> => {
  if (maxTokens === -1) {
    return text;
  }

  const encoder = await initializeEncoder();
  const encoded = encoder.encode(text);

  if (encoded.length <= maxTokens) {
    return text;
  }

  // トークン数を指定の長さまで切り詰める
  const trimmedEncoded = encoded.slice(0, maxTokens);
  const decoded = encoder.decode(trimmedEncoded);

  // デコードされたUint8Arrayをテキストデコーダーで文字列に変換
  return new TextDecoder().decode(decoded);
};

export const trimMessageHistory = async (
  messages: Message[],
  maxTokens: number
): Promise<Message[]> => {
  if (maxTokens === -1) {
    return messages;
  }

  const encoder = await initializeEncoder();

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
