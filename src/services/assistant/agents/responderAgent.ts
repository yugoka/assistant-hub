import { AssistantAPIParam, ResponderAgentParam } from "@/types/api/Assistant";
import OpenAI from "openai";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources";
import {
  ChatCompletionCreateParamsBase,
  ChatCompletionTool,
} from "openai/resources/chat/completions";
import { mergeResponseObjects } from "@/utils/mergeResponseObject";
import { v4 as uuidv4 } from "uuid";
import { Message, ToolMessage } from "@/types/Message";
import { createMessage } from "@/services/messages";
import { waitUntil } from "@vercel/functions";
import { Tool } from "@/types/Tool";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const mockTools: ChatCompletionTool[] = [
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

export default class ResponderAgent {
  private readonly openai: OpenAI;
  private readonly threadID: string;
  private readonly maxToolCallSteps: number;
  private readonly save: boolean;
  private readonly model?: string;
  private currentMessages: Message[];
  private tools: ChatCompletionTool[];
  public steps: number;

  constructor({
    threadID,
    messages,
    maxToolCallSteps = MAX_TOOLCALL_STEPS,
    save = true,
    model,
  }: ResponderAgentParam) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.threadID = threadID;
    this.currentMessages = messages;
    this.maxToolCallSteps = maxToolCallSteps;
    this.save = save;
    this.tools = mockTools;
    this.steps = 0;
    this.model = model;
  }

  private async fetch() {
    const tools = this.steps < this.maxToolCallSteps ? this.tools : undefined;

    const response = await openai.chat.completions.create({
      model: this.model || process.env.CHATGPT_DEFAULT_MODEL || "gpt-4o",
      stream: true,
      messages: this.currentMessages,
      tools,
    });

    return response.toReadableStream();
  }

  public async run() {
    console.log("=== Running Responder Agent ===");
    if (!this.currentMessages.length) {
      throw new Error("Messages array is empty");
    }

    // 最後に保存するメッセージのリスト
    const messagesToSave: Message[] = [];

    // ユーザーからのメッセージを保存する
    const lastMessage = this.currentMessages[this.currentMessages.length - 1];
    messagesToSave.push(lastMessage);

    // readableStreamの処理の中からagentの情報にアクセスできるようにする
    const agent = this;

    const readableStream = new ReadableStream<string>({
      async start(controller) {
        while (agent.steps <= MAX_TOOLCALL_STEPS) {
          console.log(
            "Step:",
            agent.steps,
            ", Messages:",
            agent.currentMessages.length
          );

          const responseStream = await agent.fetch();
          const reader = responseStream.getReader();
          const decoder = new TextDecoder();

          // 現在の返答のUUID
          const currentMessageUUID = uuidv4();

          let newChunkObject = {} as ChatCompletionChunk;
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
            thread_id: agent.threadID,
          } as Message;

          const hasToolCall =
            newChunkObject.choices[0].finish_reason === "tool_calls";

          messagesToSave.push(newMessage);

          if (!hasToolCall) {
            agent.currentMessages = [...agent.currentMessages, newMessage];
            break;
          }

          const toolCalls =
            newMessage.role === "assistant" && newMessage.tool_calls
              ? newMessage.tool_calls
              : [];
          const toolCallResults = await agent.executeTools(toolCalls);

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
          // エージェントの動きをブロックしないために最後にまとめて保存する
          if (agent.save) {
            for (const toolMessage of toolCallResults) {
              messagesToSave.push(toolMessage);
            }
          }

          agent.currentMessages = [
            ...agent.currentMessages,
            newMessage,
            ...toolCallResults,
          ];
          agent.steps += 1;
        }

        // レスポンスが完了した後もvercelのfunctionを生存させる
        waitUntil(agent.saveMessages(messagesToSave));
        controller.close();
      },
    });

    return readableStream;
  }

  // ツール実行
  private async executeTools(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
  ): Promise<ToolMessage[]> {
    console.log("tool Calls:", toolCalls);

    const result: ToolMessage[] = toolCalls.map((toolCall) => {
      return {
        // 各toolCallResultは別メッセージなので、個別のUUIDを持つ
        // 返答を高速化するためにこちらで指定したUUIDでメッセージを保存してもらう
        id: uuidv4(),
        role: "tool",
        tool_call_id: toolCall.id || "",
        content: "実行しました",
        thread_id: this.threadID,
      };
    });

    return result;
  }

  // エージェントの動きをブロックしないために、awaitせずに使う場合がある。
  private async saveMessages(newMessages: Message[]) {
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
  }
}
