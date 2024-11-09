import { Message } from "@/types/Message";
import { trimTextByMaxTokens } from "./tokenizer/tokenizer";
import OpenAI from "openai";
import { EmbeddingCreateParams } from "openai/resources";
import { stringfyMessagesForLM } from "@/utils/message";

export type GetEmbeddingOptions = {
  model?: EmbeddingCreateParams["model"];
  dimensions?: number;
};

// ==============
// 入力文(ひとつ)をベクトル化する
// ==============
export const getEmbedding = async (
  text: string,
  options?: GetEmbeddingOptions
): Promise<number[]> => {
  const trimmedText = await trimTextByMaxTokens(
    text,
    parseInt(process.env.EMBEDDINGS_MAX_TOKENS || "") || 5160
  );

  const model =
    options?.model ||
    process.env.EMBEDDINGS_DEFAULT_MODEL ||
    "text-embedding-3-small";
  const dimensions =
    options?.dimensions ||
    parseInt(process.env.EMBEDDINGS_DEFAULT_DIMENSIONS || "") ||
    1536;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const result = await openai.embeddings.create({
    model,
    input: trimmedText,
    encoding_format: "base64",
    dimensions,
  });

  const embedding = base64ToFloat32ArrayNode(`${result.data[0].embedding}`);
  return embedding;
};

// ==============
// 入力文(複数)をベクトル化する
// ==============
export const getEmbeddings = async (
  textList: string[],
  options?: GetEmbeddingOptions
): Promise<number[][]> => {
  const promises = textList.map((text) => getEmbedding(text, options));
  const result = await Promise.all(promises);
  return result;
};

// ==============
// 複数のベクトルを平均して一つのベクトルにする
// ==============
export const averageEmbeddings = (embeddings: number[][]): number[] => {
  if (embeddings.length === 0) {
    throw new Error("Embeddings array is empty");
  }

  const dimensions = embeddings[0].length;
  const sumEmbedding = new Array(dimensions).fill(0);

  for (const embedding of embeddings) {
    if (embedding.length !== dimensions) {
      throw new Error("All embeddings must have the same dimensions");
    }
    for (let i = 0; i < dimensions; i++) {
      sumEmbedding[i] += embedding[i];
    }
  }

  return normalize(sumEmbedding);
};

// ==============
// 入力文(複数)をベクトル化し、平均して一つのベクトルにする
// ==============
export const getAndAverageEmbeddings = async (
  textList: string[],
  options?: GetEmbeddingOptions
): Promise<number[]> => {
  const embeddings = await getEmbeddings(textList, options);
  return averageEmbeddings(embeddings);
};

// ==============
// Message[] からベクトルを得る
// ==============
export const getEmbeddingFromMessages = async (
  messages: Message[]
): Promise<number[]> => {
  const messagesText = stringfyMessagesForLM(messages);
  return await getEmbedding(messagesText);
};

// embedding apiのレスポンス変換用(base64 -> float32)
export const base64ToFloat32ArrayNode = (base64String: string): number[] => {
  // Base64文字列をバッファに変換
  const buffer = Buffer.from(base64String, "base64");

  // バッファをFloat32Arrayに変換
  const floatArray = new Float32Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.length / Float32Array.BYTES_PER_ELEMENT
  );

  // Float32ArrayをNumberの配列に変換
  return Array.from(floatArray);
};

// 正規化
function normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

  if (magnitude === 0) {
    return new Array(vector.length).fill(0);
  }

  return vector.map((val) => val / magnitude);
}
