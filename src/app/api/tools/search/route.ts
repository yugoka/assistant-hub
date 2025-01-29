import {
  convertRegisteredToolsToOpenAITools,
  OpenAIToolWithoutExecutor,
} from "@/services/schema/openapiToTools";
import {
  getToolsByEmbedding,
  getToolsByPrompt,
  ToolSearchBaseOptions,
} from "@/services/tools";
import { Tool } from "@/types/Tool";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// ==============
// ツール検索
// ==============
export const runtime = "edge";

export interface GetToolsByQueryOrEmbeddingOptions
  extends ToolSearchBaseOptions {
  embedding?: number[];
  query?: string;
  trimQuery?: boolean;
  openai_tools_mode?: boolean;
}
export async function POST(req: Request) {
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

    const reqBody = await req.json();

    const params: GetToolsByQueryOrEmbeddingOptions = {
      query: reqBody.query,
      embedding: reqBody.embedding,
      similarityThreshold: reqBody.similarityThreshold,
      minTools: reqBody.minTools,
      maxTools: reqBody.maxTools,
      trimQuery: reqBody.trimQuery,
    };

    if (params.embedding) {
      // embeddingによる直接検索
      const result = await getToolsByEmbedding({
        embedding: params.embedding,
        similarityThreshold: params.similarityThreshold,
        minTools: params.minTools,
        maxTools: params.maxTools,
      });
      const finalResult = await finalizeResult(
        result,
        reqBody.openai_tools_mode
      );
      return NextResponse.json(finalResult, { status: 200 });
    } else if (params.query) {
      //クエリによる検索
      const result = await getToolsByPrompt({
        query: params.query,
        similarityThreshold: params.similarityThreshold,
        minTools: params.minTools,
        maxTools: params.maxTools,
        trimQuery: params.trimQuery,
      });
      const finalResult = await finalizeResult(
        result,
        reqBody.openai_tools_mode
      );
      return NextResponse.json(finalResult, { status: 200 });
    } else {
      return new Response(
        JSON.stringify({
          error:
            "Bad Request: Neither prompt nor embedding are set. Please set either one.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
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

const finalizeResult = async (tools: Tool[], openai_tools_mode: boolean) => {
  if (!openai_tools_mode) {
    return tools;
  } else {
    return await addOpenAIToolsDefinition(tools);
  }
};

// 条件に応じてresultにOpenAIツールを付加する
// TODO: 一連の流れをservicesに分離
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
