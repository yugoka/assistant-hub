import { Tool } from "@/types/Tool";
import {
  convertRegisteredToolsToOpenAITools,
  OpenAIToolWithoutExecutor,
} from "./openapiToTools";

// toolsにopenai tools(function calling)の情報を付加する
export const addOpenAIToolsDefinition = async (
  tools: Tool[]
): Promise<OpenAIToolWithoutExecutor[]> => {
  const result = [];
  for (const tool of tools) {
    const openaiTools = await convertRegisteredToolsToOpenAITools(tool);
    const openaiToolsWithoutExecutor = openaiTools.map((tool) => {
      const { execute, ...rest } = tool;
      return rest;
    });
    result.push(...openaiToolsWithoutExecutor);
  }
  return result;
};
