import OpenAI from "openai";
import { ChatCompletionMessage } from "openai/resources";

export const runResnponderAgent = async (messages: ChatCompletionMessage[]) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages,
  });

  return response;
};
