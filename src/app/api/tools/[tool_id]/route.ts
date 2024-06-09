import { UpdateToolInput, updateTool } from "@/services/tools";
import { NextResponse } from "next/server";

export const runtime = "edge";

// ツール更新
export async function PUT(
  req: Request,
  { params }: { params: { tool_id: string } }
) {
  try {
    const reqBody = await req.json();

    const updateParams: UpdateToolInput = {
      id: params.tool_id,
      name: reqBody.name,
      description: reqBody.description,
      schema: reqBody.schema,
      auth_type: reqBody.auth_type,
      credential: reqBody.credential,
      execution_count: reqBody.execution_count,
      average_execution_time: reqBody.average_execution_time,
      success_count: reqBody.success_count,
    };

    const result = await updateTool(updateParams);
    const res = NextResponse.json(result, { status: 200 });
    return res;
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
