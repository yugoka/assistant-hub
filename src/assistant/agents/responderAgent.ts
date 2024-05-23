import { AssistantAPIParam } from "@/types/api/Assistant";
import OpenAI from "openai";
import {
  ChatCompletionChunk,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";
import { mergeResponseObjects } from "@/utils/mergeResponseObject";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/types/Message";

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
export const runResponderAgent = async (
  { messages }: AssistantAPIParam,
  steps = 1
) => {
  let currentMessages = messages;

  const readableStream = new ReadableStream<string>({
    async start(controller) {
      while (steps <= MAX_TOOLCALL_STEPS) {
        console.log("=== Running Responder Agent ===");
        console.log("Steps:", steps);
        console.log("Messages:", currentMessages);

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
              // 各メッセージオブジェクトはIDで識別する
              id: currentMessageUUID,
              ...parsedChunk.choices[0].delta,
            }) + "\n"
          );
        }

        const newMessage = newChunkObject.choices[0]
          .delta as ChatCompletionMessage;

        const hasToolCall =
          newChunkObject.choices[0].finish_reason === "tool_calls";

        if (!hasToolCall) {
          currentMessages = [...currentMessages, newMessage];
          break;
        }

        const toolCalls = newMessage.tool_calls || [];
        const toolCallResults = await executeTools(toolCalls);

        controller.enqueue(
          toolCallResults
            .map(
              (toolCallResult) =>
                JSON.stringify({
                  // 各toolCallResultは別メッセージなので、個別のUUIDを持つ
                  id: uuidv4(),
                  ...toolCallResult,
                }) + "\n"
            )
            .join("")
        );

        currentMessages = [...currentMessages, newMessage, ...toolCallResults];
        steps += 1;
      }

      console.log("Final Messages:", currentMessages);
      controller.close();
    },
  });

  return readableStream;
};

const toolMessages = [
  "藤沢市は晴れで、気温は23℃です",
  "平塚市市は晴れで、気温は17℃です",
  "クーラーの設定温度を23℃にしました",
  "実行に失敗しました",
];
const executeTools = async (
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
): Promise<ChatCompletionToolMessageParam[]> => {
  console.log("tool Calls:", toolCalls);
  let i = 0;

  return toolCalls.map((toolCall) => {
    i += 1;
    return {
      role: "tool",
      tool_call_id: toolCall.id || "",
      content: toolMessages[Math.min(i - 1, toolMessages.length - 1)],
    } as ChatCompletionToolMessageParam;
  });
};