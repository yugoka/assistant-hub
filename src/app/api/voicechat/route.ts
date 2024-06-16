import ResponderAgent from "@/services/assistant/agents/ResponderAgent";
import { getMessagesFromAssistantAPIParams } from "@/services/assistant/apiUtils";
import { AssistantAPIParam, ResponderAgentParam } from "@/types/api/Assistant";
import { ChatCompletionMessage } from "openai/resources";

//============
// ボイスチャット用API
// 余計な情報を廃してアシスタントの発言だけを返します
//============
export const runtime = "edge";

export async function POST(req: Request) {
  const params: AssistantAPIParam = await req.json();
  if (!params.threadID) {
    throw new Error("Thread ID not specified");
  }

  const messages = await getMessagesFromAssistantAPIParams(params);
  const responderAgentParams: ResponderAgentParam = {
    ...params,
    messages,
  };

  const agent = new ResponderAgent(responderAgentParams);
  const responseStream = await agent.run();
  const modifiedStream = await modifyStreamForVoiceChat(responseStream);

  // ストリームをそのままレスポンスとして返す
  return new Response(modifiedStream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

async function modifyStreamForVoiceChat(
  stream: ReadableStream<string>
): Promise<ReadableStream<Uint8Array>> {
  const reader = stream.getReader();
  const encoder = new TextEncoder();
  const modifiedStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const modifiedValue = modifyChunkForVoiceChat(value);

        if (modifiedValue) {
          // 文字列をエンコードしてUint8Arrayに変換
          const encodedValue = encoder.encode(modifiedValue);
          controller.enqueue(encodedValue);
        }
      }
      controller.close();
    },
  });

  return modifiedStream;
}

function modifyChunkForVoiceChat(chunk: string): string {
  // チャンクを加工
  const messageObject = JSON.parse(chunk) as ChatCompletionMessage;
  return messageObject.content || "";
}
