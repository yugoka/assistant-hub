import { convertRegisteredToolsToOpenAITools } from "@/services/schema/openapiToTools";
import { getToolByID } from "@/services/tools";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// ツール実行
export type ToolExecutionApiParams = {
  arguments: string;
  path: string;
  method: string;
  save_tool_call?: boolean;
};

export async function POST(
  req: Request,
  { params }: { params: { tool_id: string } }
) {
  try {
    const reqBody: ToolExecutionApiParams = await req.json();

    const targetTool = await getToolByID({ toolID: params.tool_id });
    if (!targetTool) {
      return new Response(
        JSON.stringify({
          error:
            "You do not have permission to access this tool, or the API key is invalid.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 実行用関数を取得
    const toolsWithExecutor = await convertRegisteredToolsToOpenAITools(
      targetTool
    );

    const targetMethod = toolsWithExecutor.find(
      (tool) => tool.path === reqBody.path && tool.method === reqBody.method
    );
    if (!targetMethod) {
      return new Response(
        JSON.stringify({
          error: `Could not find method: ${reqBody.path}:${reqBody.method}`,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const result = await targetMethod.execute(reqBody.arguments);
    return NextResponse.json(result, { status: 200 });
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
