import { AssistantAPIParam } from "@/types/api/Assistant";
import OpenAI from "openai";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionChunk,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";
import { mergeResponseObjects } from "@/utils/mergeResponseObject";

const mockTools = [
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "Get the current weather in a given location",
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
        required: ["teperature"],
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

export const runResponderAgent = async (
  { messages }: AssistantAPIParam,
  steps = 1
) => {
  let currentMessages = messages;

  const readableStream = new ReadableStream({
    async start(controller) {
      while (steps <= MAX_TOOLCALL_STEPS) {
        console.log("=== Running Responder Agent ===");
        console.log("Steps:", steps);
        console.log("Messages:", currentMessages);

        // ここにデータが溜まっていく
        const newChunkObject = {} as ChatCompletionChunk;

        const responseStream = await fetchResponderAgentResponse(
          currentMessages,
          steps
        );
        const reader = responseStream.getReader();
        const decoder = new TextDecoder();

        // 各メッセージ内のデータをストリーミング
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const parsedChunk = JSON.parse(chunk) as ChatCompletionChunk;
          // データを貯めていく
          mergeResponseObjects(newChunkObject, parsedChunk);

          controller.enqueue(chunk); // クライアントに送信
        }

        const newMessage = newChunkObject.choices[0]
          .delta as ChatCompletionMessage;
        const hasToolCall =
          newChunkObject.choices[0].finish_reason === "tool_calls";

        // ToolCallがないならここでレスポンスを打ち止めにする
        if (!hasToolCall) {
          currentMessages = [...currentMessages, newMessage];
          break;
        }

        // ツールを実行する
        const toolCalls = newMessage.tool_calls || [];
        const toolCallResults = await executeTools(toolCalls);

        currentMessages = [...currentMessages, newMessage, ...toolCallResults];
        steps += 1;
      }

      console.log("Final Messages:", currentMessages);
      controller.close();
    },
  });

  return readableStream;
};

let i = 0;
const messages = [
  "藤沢市の気温は１５℃です",
  "クーラーの設定温度を15℃にしました",
  "実行に失敗しました",
];
const executeTools = async (
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
): Promise<ChatCompletionToolMessageParam[]> => {
  console.log("tool Calls:", toolCalls);
  return toolCalls.map((toolCall) => {
    i += 1;
    return {
      role: "tool",
      tool_call_id: toolCall.id || "",
      content: messages[i - 1],
    } as ChatCompletionToolMessageParam;
  });
};
