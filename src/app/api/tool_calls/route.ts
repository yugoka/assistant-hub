import { createToolCall, CreateToolCallInput } from "@/services/tool_calls";
import { NextResponse } from "next/server";

export const runtime = "edge";

// ToolCall作成
export async function POST(req: Request) {
  try {
    const reqBody = await req.json();

    const params: CreateToolCallInput = {
      id: reqBody.id,
      tool_id: reqBody.tool_id,
      tool_call_id: reqBody.tool_call_id,
      execution_time: reqBody.execution_time,
      contextMessages: reqBody.contextMessages,
    };

    const result = await createToolCall(params);
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
