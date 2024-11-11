import {
  getToolsByEmbedding,
  getToolsByPrompt,
  ToolSearchBaseOptions,
} from "@/services/tools";
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
      return NextResponse.json(result, { status: 200 });
    } else if (params.query) {
      //クエリによる検索
      const result = await getToolsByPrompt({
        query: params.query,
        similarityThreshold: params.similarityThreshold,
        minTools: params.minTools,
        maxTools: params.maxTools,
        trimQuery: params.trimQuery,
      });
      return NextResponse.json(result, { status: 200 });
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
