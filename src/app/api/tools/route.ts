import { CreateToolInput, createTool } from "@/services/tools";
import { NextResponse } from "next/server";

export const runtime = "edge";

// ツール作成
export async function POST(req: Request) {
  try {
    const reqBody = await req.json();

    const params: CreateToolInput = {
      name: reqBody.name,
      description: reqBody.description,
      schema: reqBody.schema,
      auth_type: reqBody.auth_type,
      credential: reqBody.credential,
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
