import { Message } from "@/types/Message";
import { parseMessageContent } from "../../utils/message";
import { Tiktoken, TiktokenBPE } from "js-tiktoken/lite";

// トークナイザーの初期化
let tiktoken: Tiktoken | null = null;
const initializeTokenizer = async (): Promise<Tiktoken> => {
  if (!tiktoken) {
    const { default: ranks } = await import("./tokenizer-ranks");
    tiktoken = new Tiktoken(ranks);
  }
  return tiktoken;
};

// テキストのトークン数を計算
export const countTokens = async (text: string): Promise<number> => {
  const tokenizer = await initializeTokenizer();
  return tokenizer.encode(text).length;
};

// テキストを最大トークン数で切り詰める
export const trimTextByMaxTokens = async (
  text: string,
  maxTokens: number
): Promise<string> => {
  if (maxTokens === -1) return text;

  const tokenizer = await initializeTokenizer();
  const encoded = tokenizer.encode(text);

  if (encoded.length <= maxTokens) return text;

  const trimmedEncoded = encoded.slice(0, maxTokens);
  return tokenizer.decode(trimmedEncoded);
};

// 各toolCalls -> tool
interface MessageGroup {
  messages: Message[];
  toolCallMessage: Message | null; // tool_calls を含むメッセージ
  toolMessages: Message[]; // 対応する tool レスポンス
}

// メッセージをグループ化して関連するtool呼び出しとレスポンスをまとめる
const groupMessagesByToolCall = (messages: Message[]): MessageGroup[] => {
  const groups: MessageGroup[] = [];
  let currentGroup: MessageGroup = {
    messages: [],
    toolCallMessage: null,
    toolMessages: [],
  };

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    // toolCall
    if (message.role === "assistant" && message.tool_calls?.length) {
      groups.push(currentGroup);
      currentGroup = {
        messages: [message],
        toolCallMessage: message,
        toolMessages: [],
      };
    } else {
      // tool呼び出し結果
      if (message.role === "tool") {
        currentGroup.messages.push(message);
        currentGroup.toolMessages.push(message);
      } else {
        // user, assistantなどのメッセージ(この場合もグループを始める)
        groups.push(currentGroup);
        currentGroup = {
          messages: [message],
          toolCallMessage: null,
          toolMessages: [],
        };
      }
    }
  }

  groups.push(currentGroup);
  return groups;
};

// メッセージ履歴をトリミング
export const trimMessageHistory = async (
  messages: Message[],
  maxTokens: number
): Promise<Message[]> => {
  if (maxTokens === -1) return messages;

  // メッセージをグループ化
  const groups = await groupMessagesByToolCall(messages);
  const trimmedMessages: Message[] = [];

  // 後ろから順にグループを追加していく
  let totalTokens = 0;

  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    for (const message of group.messages) {
      const tokenCount = await countTokens(
        parseMessageContent(message.content) || ""
      );
      totalTokens += tokenCount;
      if (totalTokens > maxTokens) break;
    }
    if (totalTokens > maxTokens) break;

    trimmedMessages.push(...group.messages);
  }

  // メッセージが一つも入らない場合はエラー
  if (trimmedMessages.length === 0) {
    throw new Error(
      "Message too long: The last message exceeds the maximum token limit"
    );
  }

  // グループを展開して配列に戻す
  return trimmedMessages;
};
