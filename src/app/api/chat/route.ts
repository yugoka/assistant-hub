import { runResponderAgent } from "@/services/assistant/agents/responderAgent";
import { AssistantAPIParam } from "@/types/api/Assistant";

//============
// 外部用API
//============
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const params: AssistantAPIParam = await req.json();
    const responseStream = await runResponderAgent(params);
    const modifiedStream = await modifyStreamForWebChat(responseStream);

    // ストリームをそのままレスポンスとして返す
    return new Response(modifiedStream, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

async function modifyStreamForWebChat(
  stream: ReadableStream<string>
): Promise<ReadableStream<Uint8Array>> {
  const reader = stream.getReader();
  const encoder = new TextEncoder();
  const modifiedStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const modifiedValue = modifyChunkForWebChat(value);

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

// ここでチャンクを編集。そのまま返してもok
function modifyChunkForWebChat(chunk: string): string {
  return chunk;
}
