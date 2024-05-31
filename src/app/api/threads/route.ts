import {
  CreateThreadInput,
  GetThreadByIDOptions,
  GetThreadsOptions,
  createThread,
} from "@/services/threads";
import { NextResponse } from "next/server";

export const runtime = "edge";

// スレッド作成
export async function POST(req: Request) {
  try {
    const params: CreateThreadInput = await req.json();
    const result = await createThread(params);
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
