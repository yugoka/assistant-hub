// スレッド取得(by id)

import { getThreadByID } from "@/services/threads";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { thread_id: string } }
) {
  try {
    const threadID = params.thread_id;

    if (!threadID) {
      return new Response(
        JSON.stringify({ error: "Bad Request: thread_id is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const result = await getThreadByID({
      threadID,
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
