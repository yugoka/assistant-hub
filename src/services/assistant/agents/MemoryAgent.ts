import {
  getMemoryGenerationPrompt,
  MemoryGenerationResponseFormat,
} from "@/prompts/memory";
import {
  countTokens,
  trimTextByMaxTokens,
} from "@/services/tokenizer/tokenizer";
import OpenAI from "openai";

export const generateMemory = async ({
  currentMemory,
  userInputString,
  maxTokens,
  model = "gpt-4o-mini",
}: {
  currentMemory: string;
  userInputString: string;
  maxTokens: number;
  model: string;
}): Promise<string> => {
  try {
    if (!userInputString) return currentMemory;

    const currentMemoryTokens = await countTokens(currentMemory);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { systemPrompt, userPrompt } = getMemoryGenerationPrompt(
      currentMemory,
      userInputString,
      maxTokens,
      currentMemoryTokens
    );

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
      temperature: 0,
    });

    const resultJson = response.choices[0].message.content;
    const result: MemoryGenerationResponseFormat = JSON.parse(resultJson || "");

    if (
      result.need_update &&
      result.updated_memory !== undefined &&
      result.updated_memory !== null
    ) {
      // maxTokensで切り捨てる
      return await trimTextByMaxTokens(result.updated_memory, maxTokens);
    } else {
      return currentMemory;
    }
  } catch (e) {
    console.error(e);
    return currentMemory;
  }
};
