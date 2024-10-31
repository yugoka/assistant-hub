import { Message, MessageForDB } from "@/types/Message";
import { parseMessageContent } from "@/utils/message";
import { createClient } from "@/utils/supabase/server";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";

// ==============
// メッセージ作成
// idが事前生成される場合があるので、idごと受け取る
// ==============
export const createMessage = async (newMessage: Message): Promise<Message> => {
  const supabase = createClient();
  // supabase登録用に形式を変換する
  const input: MessageForDB = convertMessageForDB(newMessage);

  const { data, error } = await supabase
    .from("messages")
    .insert([input])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const result = parseDBMessage(data);

  return result;
};

// ==============
// スレッドIDによるメッセージ取得
// ==============
interface GetMessagesByThreadIdOptions {
  threadID: string;
  page?: number;
  pageSize?: number;
}
export const getMessagesByThreadID = async ({
  threadID,
  page,
  pageSize = 10,
}: GetMessagesByThreadIdOptions): Promise<Message[]> => {
  if (!threadID) {
    throw new Error("Thread ID not specified");
  }
  const supabase = createClient();

  let query = supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadID)
    .order("created_at");
  if (page !== undefined) {
    query = query.range((page - 1) * pageSize, page * pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }

  // フロントで読める形にパースし直す
  const parsedMessage = data.map((message) => parseDBMessage(message));

  return parsedMessage || [];
};

// ==============
// メッセージを保存用に変換、正規化
// ==============
const convertMessageForDB = (message: Message): MessageForDB => {
  const toolCalls = message.role === "assistant" && message.tool_calls;

  return {
    id: message.id,
    thread_id: message.thread_id,
    role: message.role,
    tool_call_id: message.role === "tool" ? message.tool_call_id : undefined,
    // ↓create時は不要
    // created_at: message.created_at,
    content: parseMessageContent(message.content) || undefined,
    tool_calls: toolCalls ? JSON.stringify(toolCalls) : undefined,
  };
};

// ==============
// DBから取ってきたメッセージを表示用に変換
// ==============
const parseDBMessage = (messageForDB: MessageForDB): Message => {
  if (messageForDB.role === "assistant") {
    return {
      ...messageForDB,
      role: messageForDB.role,
      tool_calls: messageForDB.tool_calls
        ? JSON.parse(messageForDB.tool_calls)
        : undefined,
    };
  } else if (messageForDB.role === "user") {
    return {
      ...messageForDB,
      role: messageForDB.role,
      content: messageForDB.content || "",
    };
  } else if (messageForDB.role === "system") {
    return {
      ...messageForDB,
      role: messageForDB.role,
      content: messageForDB.content || "",
    };
  } else if (messageForDB.role === "tool") {
    return {
      ...messageForDB,
      role: messageForDB.role,
      content: messageForDB.content || "",
      tool_call_id: messageForDB.tool_call_id || "",
    };
  } else {
    throw new Error("Invalid Message role:", messageForDB.role);
  }
};

// ==============
// 独自拡張のMessagesをOpenAI互換の形式に変換
// ==============
export function convertToOpenAIMessages(
  messages: Message[]
): ChatCompletionMessageParam[] {
  return messages.map((msg): ChatCompletionMessageParam => {
    const baseMessage = {
      role: msg.role,
      content: msg.content ?? null,
    };

    switch (msg.role) {
      case "system":
        return baseMessage as ChatCompletionSystemMessageParam;

      case "user":
        return {
          ...baseMessage,
          name: msg.name,
        } as ChatCompletionUserMessageParam;

      case "assistant":
        return {
          ...baseMessage,
          tool_calls: msg.tool_calls ?? null,
          name: msg.name,
        } as ChatCompletionAssistantMessageParam;

      case "tool":
        return {
          ...baseMessage,
          tool_call_id: msg.tool_call_id,
        } as ChatCompletionToolMessageParam;
    }
  });
}
