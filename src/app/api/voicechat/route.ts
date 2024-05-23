import { runResponderAgent } from "@/app/assistant/agents/responderAgent";
import { AssistantAPIParam } from "@/types/api/Assistant";
import { StreamingTextResponse } from "ai";
import { ChatCompletionMessage } from "openai/resources";

//============
// 内部用API
//============
export const runtime = "edge";

export async function POST(req: Request) {
  const params: AssistantAPIParam = await req.json();
  const responseStream = await runResponderAgent(params);
  const modifiedStream = await modifyStreamForWebChat(responseStream);

  // ストリームをそのままレスポンスとして返す
  return new Response(modifiedStream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

async function modifyStreamForWebChat(
  stream: ReadableStream<string>
): Promise<ReadableStream<string>> {
  const reader = stream.getReader();
  const modifiedStream = new ReadableStream<string>({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const modifiedValue = modifyChunkForWebChat(value);

        if (modifiedValue) {
          controller.enqueue(modifiedValue);
        }
      }
      controller.close();
    },
  });

  return modifiedStream;
}

function modifyChunkForWebChat(chunk: string): string {
  // ここでチャンクを編集します。例えば、すべての文字を大文字に変換する:
  const messageObject = JSON.parse(chunk) as ChatCompletionMessage;
  return messageObject.content || "";
}
