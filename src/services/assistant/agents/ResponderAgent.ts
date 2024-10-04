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
  convertRegisteredToolsToOpenAITools,
  OpenAIToolWithExecutor,
} from "../../schema/openapiToTools";
import { Thread } from "@/types/Thread";
import { getThreadByID } from "@/services/threads";
import { trimMessageHistory } from "@/utils/tokenizer";

const MAX_STEPS = 5;

export default class ResponderAgent {
  private readonly openai: OpenAI;
  private readonly threadID: string;
  private readonly maxToolCallSteps: number;
  private readonly save: boolean;
  private readonly model?: string;
  private inputMessages: Message[];
  private currentMessages: Message[];
  private tools: OpenAIToolWithExecutor[];
  private toolsMap: Map<string, OpenAIToolWithExecutor>;
  private thread: Thread | null;
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
    this.inputMessages = messages;
    this.currentMessages = [];
    this.maxToolCallSteps = maxSteps;
    this.save = save;
    this.tools = [];
    // function nameをキーとした連想配列
    this.toolsMap = new Map<string, OpenAIToolWithExecutor>();
    this.steps = 0;
    this.model = model;
    this.thread = null;
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
    if (!this.inputMessages.length) {
      throw new Error("Messages array is empty");
    }
    await this.loadThread();
    await this.initMessages();
    await this.initTools();
  }

  private async initTools() {
    console.log("Initializing tools...");
    // 直近5件を取る(現状はマジックナンバー)
    const suggestedTools = await getToolsByPrompt({
      query: stringfyMessagesForLM(this.currentMessages.slice(-5)) || "",
    });
    console.log(suggestedTools.map((tool) => [tool.name, tool.similarity]));

    const toolConvertPromises = suggestedTools.map(async (suggestedTool) => {
      return await convertRegisteredToolsToOpenAITools(suggestedTool);
    });
    const toolConvertResults = await Promise.all(toolConvertPromises);
    const tools = toolConvertResults.flat();
    this.tools = tools;

    for (const tool of tools) {
      this.toolsMap.set(tool.function.name, tool);
    }
  }

  private async loadThread() {
    console.log("Loading thread...");
    const result = await getThreadByID({ threadID: this.threadID });
    this.thread = result;
  }

  private async initMessages() {
    console.log("Initializing messages...");
    this.currentMessages = await trimMessageHistory(
      this.inputMessages,
      this.thread?.maximum_input_tokens || 0
    );
    console.log(this.currentMessages);
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
    const tools =
      this.steps < this.maxToolCallSteps && this.tools.length
        ? this.tools
        : undefined;
    const response = await this.openai.chat.completions.create({
      model: this.model || process.env.CHATGPT_DEFAULT_MODEL || "gpt-4o",
      stream: true,
      messages: this.currentMessages,
      tools,
    });
    return response.toReadableStream();
  }

  private getToolByName(name: string): OpenAIToolWithExecutor | undefined {
    return this.toolsMap.get(name);
  }

  private async executeTools(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
  ): Promise<ToolMessage[]> {
    const promises = toolCalls.map(async (toolCall) => {
      const calledTool = this.getToolByName(toolCall.function.name);
      const toolCallResult: ToolMessage = {
        id: uuidv4(),
        role: "tool",
        tool_call_id: toolCall.id || "",
        content: "",
        thread_id: this.threadID,
      };
      if (!calledTool) {
        toolCallResult.content = "Failed to execute function";
      } else {
        const result = await calledTool.execute(toolCall.function.arguments);
        toolCallResult.content = JSON.stringify(result, null, 2);
      }
      return toolCallResult;
    });

    const result: ToolMessage[] = await Promise.all(promises);

    return result;
  }

  private async saveMessages(newMessages: Message[]) {
    try {
      for await (const message of newMessages) {
        const newMessage = message;

        // 保存用にツール情報を付加する
        if (newMessage.role === "assistant" && newMessage.tool_calls?.length) {
          newMessage.tool_calls = newMessage.tool_calls.map((toolCall) => {
            const calledTool = this.getToolByName(toolCall.function.name);
            return {
              ...toolCall,
              operationId: calledTool?.operationId,
              method: calledTool?.method,
              path: calledTool?.path,
              baseToolName: calledTool?.baseTool.name,
            };
          });
        }

        await createMessage(newMessage);
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
