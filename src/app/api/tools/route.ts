import {
  CreateToolInput,
  createTool,
  getToolByID,
  getTools,
} from "@/services/tools";
import { NextResponse } from "next/server";

export const runtime = "edge";

// ==============
// ツール作成
// ==============
export async function POST(req: Request) {
  try {
    const reqBody = await req.json();

    const params: CreateToolInput = {
      name: reqBody.name,
      description: reqBody.description,
      schema: reqBody.schema,
      auth_type: reqBody.auth_type,
      credential: reqBody.credential,
      instruction_examples: reqBody.instruction_examples,
    };

    const result = await createTool(params);
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
// ツール取得
// ==============
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const toolID = url.searchParams.get("tool_id");
    const userID = url.searchParams.get("user_id");

    if (!toolID && !userID) {
      return new Response(
        JSON.stringify({ error: "Neither tool_id nor user_id specified" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (toolID) {
      const result = await getToolByID({
        toolID,
      });

      const res = NextResponse.json(result, { status: 200 });
      return res;
    } else if (userID) {
      const result = await getTools({ userId: userID });
      const res = NextResponse.json(result, { status: 200 });
      return res;
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
