import ResponderAgent from "@/services/assistant/agents/ResponderAgent";
import { getMessagesFromAssistantAPIParams } from "@/services/assistant/apiUtils";
import { AssistantAPIParam, ResponderAgentParam } from "@/types/api/Assistant";
import { mergeResponseObjects } from "@/utils/mergeResponseObject";
import { NextRequest } from "next/server";

//============
// 外部用API
//============
export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const params: AssistantAPIParam = {
      threadID: reqBody.threadID,
      messages: reqBody.messages,
      content: reqBody.content,
      save: reqBody.save,
      maxSteps: reqBody.maxSteps,
      model: reqBody.model,
      stream: reqBody.stream ?? true, // streamが指定されていない場合はtrue
    };

    if (!params.threadID) {
      throw new Error("Thread ID not specified");
    }

    const messages = await getMessagesFromAssistantAPIParams(params);
    const responderAgentParams: ResponderAgentParam = {
      ...params,
      messages,
    };

    const agent = new ResponderAgent(responderAgentParams);

    if (params.stream) {
      // ストリーミングモード
      const responseStream = await agent.run();
      const modifiedStream = await modifyStreamForWebChat(responseStream);

      return new Response(modifiedStream, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      // 非ストリーミングモード
      let mergedResponse = {};
      const responseStream = await agent.run();
      const reader = responseStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          const parsedValue = JSON.parse(value);
          mergedResponse = mergeResponseObjects(mergedResponse, parsedValue);
        }
      }

      return new Response(JSON.stringify(mergedResponse), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(
      JSON.stringify({ error: `Internal Server Error: ${error}` }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
