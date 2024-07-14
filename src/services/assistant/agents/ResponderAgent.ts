import { ResponderAgentParam } from "@/types/api/Assistant";
import OpenAI from "openai";
import { ChatCompletionChunk } from "openai/resources";
import { mergeResponseObjects } from "@/utils/mergeResponseObject";
import { v4 as uuidv4 } from "uuid";
import { Message, ToolMessage } from "@/types/Message";
import { createMessage } from "@/services/messages";
import { waitUntil } from "@vercel/functions";
import { getToolsByPrompt } from "@/services/tools";
import { stringfyMessagesForLM } from "@/utils/message";
import {
  convertOpenAPIToTools,
  ToolWithExecutor,
} from "../toolExecution/openapiToTools";

const MAX_STEPS = 5;

export default class ResponderAgent {
  private readonly openai: OpenAI;
  private readonly threadID: string;
  private readonly maxToolCallSteps: number;
  private readonly save: boolean;
  private readonly model?: string;
  private currentMessages: Message[];
  private tools: ToolWithExecutor[];
  public steps: number;

  constructor({
    threadID,
    messages,
    maxSteps = MAX_STEPS,
    save = true,
    model,
  }: ResponderAgentParam) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.threadID = threadID;
    this.currentMessages = messages;
    this.maxToolCallSteps = maxSteps;
    this.save = save;
    this.tools = [];
    this.steps = 0;
    this.model = model;
  }

  public async run() {
    await this.initialize();

    const readableStream = new ReadableStream<string>({
      start: async (controller) => {
        await this.processSteps(controller);
        this.finalize(controller);
      },
    });

    return readableStream;
  }

  private async initialize() {
    console.log("=== Running Responder Agent ===");
    if (!this.currentMessages.length) {
      throw new Error("Messages array is empty");
    }

    // 一旦テストでツールを取ってきてみる
    const suggestedTools = await getToolsByPrompt({
      query: stringfyMessagesForLM(this.currentMessages.slice(-5)) || "",
    });

    const promises = suggestedTools.map(async (suggestedTool) => {
      return await convertOpenAPIToTools(suggestedTool.schema);
    });
    const results = await Promise.all(promises);
    this.tools = results.flat();
    console.log(this.tools);
  }

  private async processSteps(
    controller: ReadableStreamDefaultController<string>
  ) {
    const messagesToSave: Message[] = [
      this.currentMessages[this.currentMessages.length - 1],
    ];

    while (this.steps < this.maxToolCallSteps) {
      console.log(
        "Step:",
        this.steps,
        ", Messages:",
        this.currentMessages.length
      );

      const responseStream = await this.fetch();
      const reader = responseStream.getReader();
      const decoder = new TextDecoder();

      const { newMessage, newChunkObject } = await this.processResponse(
        reader,
        decoder,
        controller
      );

      messagesToSave.push(newMessage);

      if (!this.hasToolCall(newChunkObject)) {
        this.currentMessages.push(newMessage);
        break;
      }

      const toolCallResults = await this.handleToolCalls(newMessage);
      toolCallResults.forEach((result) =>
        controller.enqueue(JSON.stringify(result) + "\n")
      );

      if (this.save) {
        messagesToSave.push(...toolCallResults);
      }

      this.currentMessages.push(newMessage, ...toolCallResults);
      this.steps += 1;
    }

    waitUntil(this.saveMessages(messagesToSave));
  }

  private async processResponse(
    reader: ReadableStreamDefaultReader,
    decoder: TextDecoder,
    controller: ReadableStreamDefaultController<string>
  ) {
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
          id: currentMessageUUID,
        }) + "\n"
      );
    }

    const newMessage = {
      ...newChunkObject.choices[0].delta,
      id: currentMessageUUID,
      thread_id: this.threadID,
    } as Message;
    return { newMessage, newChunkObject };
  }

  private hasToolCall(newChunkObject: ChatCompletionChunk): boolean {
    return newChunkObject.choices[0].finish_reason === "tool_calls";
  }

  private async handleToolCalls(newMessage: Message): Promise<ToolMessage[]> {
    const toolCalls =
      newMessage.role === "assistant" && newMessage.tool_calls
        ? newMessage.tool_calls
        : [];
    return this.executeTools(toolCalls);
  }

  private finalize(controller: ReadableStreamDefaultController<string>) {
    controller.close();
  }

  private async fetch() {
    const tools = this.steps < this.maxToolCallSteps ? this.tools : undefined;
    const response = await this.openai.chat.completions.create({
      model: this.model || process.env.CHATGPT_DEFAULT_MODEL || "gpt-4o",
      stream: true,
      messages: this.currentMessages,
      tools,
    });
    return response.toReadableStream();
  }

  private async executeTools(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
  ): Promise<ToolMessage[]> {
    console.log("tool Calls:", toolCalls);

    const result: ToolMessage[] = toolCalls.map((toolCall) => {
      return {
        id: uuidv4(),
        role: "tool",
        tool_call_id: toolCall.id || "",
        content: "実行しました",
        thread_id: this.threadID,
      };
    });

    return result;
  }

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
