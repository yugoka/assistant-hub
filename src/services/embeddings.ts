import { trimTextByMaxTokens } from "./../utils/tokenizer";
import OpenAI from "openai";
import { EmbeddingCreateParams } from "openai/resources";

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
    "text-embedding-3-large";
  const dimensions =
    options?.dimensions ||
    parseInt(process.env.EMBEDDINGS_DEFAULT_DIMENSIONS || "") ||
    3072;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const result = await openai.embeddings.create({
    model,
    input: trimmedText,
    encoding_format: "float",
    dimensions,
  });

  const embedding = result.data[0].embedding;
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

  return sumEmbedding.map((sum) => sum / embeddings.length);
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
