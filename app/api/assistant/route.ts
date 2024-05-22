import { runResnponderAgent } from "@/app/assistant/agents/responderAgent";
import { OpenAIStream, StreamingTextResponse, streamText } from "ai";
import OpenAI from "openai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await runResnponderAgent(messages);

  // Streamを複製
  const [clientResponse, serverResponse] = response.tee();
  const clientStream = clientResponse.toReadableStream();
  const serverStream = serverResponse.toReadableStream();

  // チャンクを収集するリストを用意
  const chunks: string[] = [];

  // サーバー側のストリームを読み取る
  const reader = serverStream.getReader();
  const decoder = new TextDecoder();

  async function readStream() {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Streamが終了したら返答を保存
        saveConversationData(chunks);
        break;
      }
      // チャンクをデコードしてリストに追加
      const decodedChunk = decoder.decode(value, { stream: true });
      chunks.push(decodedChunk);
    }
  }

  // ストリームの読み取りを開始
  readStream();

  // クライアントにストリームを返す
  return new StreamingTextResponse(clientStream);
}

async function saveConversationData(chunks: string[]) {
  const text = chunks
    .map((chunk) => JSON.parse(chunk).choices[0].delta.content)
    .join("");

  // ここにデータベースやファイルに保存するロジックを記述
  console.log("会話データを保存:", text);
}
