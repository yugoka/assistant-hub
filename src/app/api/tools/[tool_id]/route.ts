import {
  UpdateToolInput,
  deleteTool,
  getToolByID,
  updateTool,
} from "@/services/tools";
import { NextResponse } from "next/server";

export const runtime = "edge";

// ==============
// ツール取得(by id)
// ==============
export async function GET(
  req: Request,
  { params }: { params: { tool_id: string } }
) {
  try {
    const toolID = params.tool_id;

    if (!toolID) {
      return new Response(
        JSON.stringify({ error: "Bad Request: tool_id is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const result = await getToolByID({
      toolID,
    });

    if (result === null) {
      return new Response(
        JSON.stringify({
          error:
            "The thread either does not exist or you are attempting to access a resource that is not accessible with the provided API key.",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

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

// ==============
// ツール更新
// ==============
export async function PUT(
  req: Request,
  { params }: { params: { tool_id: string } }
) {
  try {
    const reqBody = await req.json();

    if (!params.tool_id) {
      return new Response(
        JSON.stringify({ error: "Bad Request: tool_id is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

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
      instruction_examples: reqBody.instruction_examples,
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

// ==============
// ツール削除
// ==============
export async function DELETE(
  req: Request,
  { params }: { params: { tool_id: string } }
) {
  try {
    if (!params.tool_id) {
      return new Response(
        JSON.stringify({ error: "Bad Request: tool_id is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    await deleteTool({ id: params.tool_id });
    const res = NextResponse.json({ status: 200 });
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
