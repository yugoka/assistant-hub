import { AssistantAPIParam, ResponderAgentParam } from "@/types/api/Assistant";
import OpenAI from "openai";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";
import { mergeResponseObjects } from "@/utils/mergeResponseObject";
import { v4 as uuidv4 } from "uuid";
import { Message, ToolMessage } from "@/types/Message";
import { createMessage } from "@/services/messages";
import { waitUntil } from "@vercel/functions";

const mockTools = [
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "Get the current weather in a given location.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA",
          },
          unit: { type: "string", enum: ["celsius", "fahrenheit"] },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "control_air_conditioner",
      description: "部屋のクーラーの温度を調整します",
      parameters: {
        type: "object",
        properties: {
          temperature: {
            type: "number",
            description: "部屋の温度",
          },
          unit: { type: "string", enum: ["celsius", "fahrenheit"] },
        },
        required: ["temperature"],
      },
    },
  },
];

const MAX_TOOLCALL_STEPS = 5;

// 返答を取ってくる
export const fetchResponderAgentResponse = async (
  messages: ChatCompletionMessageParam[],
  steps: number
) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const tools =
    steps < MAX_TOOLCALL_STEPS
      ? (mockTools as ChatCompletionCreateParamsBase["tools"])
      : undefined;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages,
    tools,
  });

  return response.toReadableStream();
};

// 再帰的にResponderAgentを呼び出してユーザーの入力を解決する
export const runResponderAgent = async ({
  messages,
  threadID,
  save = true,
}: ResponderAgentParam) => {
  console.log("=== Running Responder Agent ===");
  if (!messages.length) {
    throw new Error("Messages array is empty");
  }
  // 最後に保存するメッセージのリスト
  const messagesToSave: Message[] = [];

  // ユーザーからのメッセージを保存する
  const lastMessage = messages[messages.length - 1];
  messagesToSave.push(lastMessage);

  let steps = 1;
  let currentMessages = messages;

  const readableStream = new ReadableStream<string>({
    async start(controller) {
      while (steps <= MAX_TOOLCALL_STEPS) {
        console.log("Step:", steps, ", Messages:", messages.length);

        let newChunkObject = {} as ChatCompletionChunk;

        const responseStream = await fetchResponderAgentResponse(
          currentMessages,
          steps
        );
        const reader = responseStream.getReader();
        const decoder = new TextDecoder();

        // 現在の返答のUUID
        const currentMessageUUID = uuidv4();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const parsedChunk = JSON.parse(chunk) as ChatCompletionChunk;
          newChunkObject = mergeResponseObjects(
            newChunkObject,
            parsedChunk
          ) as ChatCompletionChunk;

          controller.enqueue(
            JSON.stringify({
              ...parsedChunk.choices[0].delta,
              // 各メッセージオブジェクトはIDで識別する
              id: currentMessageUUID,
            }) + "\n"
          );
        }

        // 完成したメッセージ
        const newMessage = {
          ...newChunkObject.choices[0].delta,
          id: currentMessageUUID,
          thread_id: threadID,
        } as Message;

        const hasToolCall =
          newChunkObject.choices[0].finish_reason === "tool_calls";

        messagesToSave.push(newMessage);

        if (!hasToolCall) {
          currentMessages = [...currentMessages, newMessage];
          break;
        }

        const toolCalls =
          newMessage.role === "assistant" && newMessage.tool_calls
            ? newMessage.tool_calls
            : [];
        const toolCallResults = await executeTools(toolCalls, threadID);

        controller.enqueue(
          toolCallResults
            .map(
              (toolCallResult) =>
                JSON.stringify({
                  ...toolCallResult,
                }) + "\n"
            )
            .join("")
        );

        // toolの実行までが終わったら一連のメッセージを保存する
        // → 実行結果のないtool_callsをログに含めるとエラーが出るため。
        // エージェントの動きをブロックしないためにawaitしない
        if (save) {
          for (const toolMessage of toolCallResults) {
            messagesToSave.push(toolMessage);
          }
        }

        currentMessages = [...currentMessages, newMessage, ...toolCallResults];
        steps += 1;
      }

      // レスポンスが完了した後もvercelのfunctionを生存させる
      waitUntil(saveMessages(messagesToSave));
      controller.close();
    },
  });

  return readableStream;
};

const toolMessages = [
  "藤沢市は晴れで、気温は23℃です",
  "クーラーの設定温度を23℃にしました",
  "実行に失敗しました",
];

let i = 0;

const executeTools = async (
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  threadID: string
): Promise<ToolMessage[]> => {
  console.log("tool Calls:", toolCalls);

  const result: ToolMessage[] = toolCalls.map((toolCall) => {
    i += 1;
    return {
      // 各toolCallResultは別メッセージなので、個別のUUIDを持つ
      // 返答を高速化するためにこちらで指定したUUIDでメッセージを保存してもらう
      id: uuidv4(),
      role: "tool",
      tool_call_id: toolCall.id || "",
      content: toolMessages[Math.min(i - 1, toolMessages.length - 1)],
      thread_id: threadID,
    };
  });

  return result;
};

// エージェントの動きをブロックしないために、awaitせずに使う場合がある。
const saveMessages = async (newMessages: Message[]) => {
  try {
    for await (const message of newMessages) {
      await createMessage(message);
      console.log(
        "[Message Saved]",
        message.role,
        message.content || "",
        message.role === "assistant" && message.tool_calls?.length
          ? `(${message.tool_calls.length} tool calls)`
          : ""
      );
    }
  } catch (error) {
    console.error("Failed to save message:", error);
  }
};
