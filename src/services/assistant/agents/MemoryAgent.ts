import {
  getMemoryGenerationPrompt,
  MemoryGenerationResponseFormat,
} from "@/prompts/memory";
import OpenAI from "openai";

export const generateMemory = async ({
  currentMemory,
  userInputString,
  maxTokens,
  model = "gpt-4o",
}: {
  currentMemory: string;
  userInputString: string;
  maxTokens: number;
  model: string;
}): Promise<string> => {
  try {
    if (!userInputString) return currentMemory;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { systemPrompt, userPrompt } = getMemoryGenerationPrompt(
      currentMemory,
      userInputString
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
      max_tokens: maxTokens,
    });

    const result: MemoryGenerationResponseFormat = JSON.parse(
      response.choices[0].message.content || ""
    );

    if (result.need_update && result.new_memory) {
      return result.new_memory;
    } else {
      return currentMemory;
    }
  } catch (e) {
    console.error(e);
    return currentMemory;
  }
};
