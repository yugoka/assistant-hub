import { GenerationTaskAPIParams } from "@/types/api/GenerationTask";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessage } from "openai/resources";

export const runtime = "edge";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//============
// ChatGPTを使ったタスクに使える内部用API
//============
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const userResponse = await supabase.auth.getUser();
    if (!userResponse.data.user) {
      return new Response(
        JSON.stringify({
          error:
            "Bad Request: This API is only available to authenticated users.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const params: GenerationTaskAPIParams = await req.json();
    const { model, messages } = params;

    const response = await openai.chat.completions.create({
      model: model || process.env.CHATGPT_DEFAULT_MODEL || "gpt-4o",
      stream: true,
      messages,
    });

    const modifiedStream = await modifyStreamForGenerationTask(
      response.toReadableStream()
    );

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

// 基本的に欲しい情報はcontentだけなので、フロント側で見やすい形に加工する
async function modifyStreamForGenerationTask(
  stream: ReadableStream<AllowSharedBufferSource>
): Promise<ReadableStream<Uint8Array>> {
  const reader = stream.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const modifiedStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const decodedValue = decoder.decode(value);
        const modifiedValue = modifyChunkForGenerationTask(decodedValue);

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

function modifyChunkForGenerationTask(chunk: string): string {
  // チャンクを加工
  const messageObject = JSON.parse(chunk);
  return messageObject.choices[0].delta.content || "";
}
