import { getToolsByPrompt, GetToolsByPromptOptions } from "@/services/tools";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// ==============
// ツール検索
// ==============
export const runtime = "edge";

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
