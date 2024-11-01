import { getToolsByPrompt, GetToolsByPromptOptions } from "@/services/tools";
import { NextResponse } from "next/server";

// ==============
// ツール検索
// ==============
export async function POST(req: Request) {
  try {
    const reqBody = await req.json();

    const params: GetToolsByPromptOptions = {
      query: reqBody.query,
      similarityThreshold: reqBody.similarityThreshold,
      minTools: reqBody.minTools,
      maxTools: reqBody.maxTools,
    };

    const result = await getToolsByPrompt(params);
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
