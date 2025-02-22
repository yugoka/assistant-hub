import {
  UpdateToolInput,
  deleteTool,
  getToolByID,
  getToolByName,
  updateTool,
} from "@/services/tools";
import { NextResponse } from "next/server";

export const runtime = "edge";

// ==============
// ツール取得(by id)
// ==============
export async function GET(
  req: Request,
  { params }: { params: { tool_id?: string; tool_name?: string } }
) {
  try {
    const toolID = params.tool_id;
    const toolName = params.tool_name;

    if (!toolID && !toolName) {
      return new Response(
        JSON.stringify({
          error: "Bad Request: tool_id or tool_name is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let result = null;

    if (toolID) {
      result = await getToolByID({
        toolID,
      });
    } else if (toolName) {
      result = await getToolByName({
        toolName,
      });
    }

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
