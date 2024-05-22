import OpenAI from "openai";
import { ChatCompletionMessage } from "openai/resources";

export const runResponderAgent = async (messages: ChatCompletionMessage[]) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages,
  });

  // ストリームをデータ保存用と返答用に分ける
  const [clientResponse, serverResponse] = response.tee();
  const serverStream = serverResponse.toReadableStream();

  // チャンクを収集するリストを用意
  const chunks: string[] = [];
  // データ保存用のストリームを読み取る
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

  return clientResponse;
};

async function saveConversationData(chunks: string[]) {
  const text = chunks
    .map((chunk) => JSON.parse(chunk).choices[0].delta.content)
    .join("");

  // ここにデータベースやファイルに保存するロジックを記述
  console.log("会話データを保存:", text);
}
