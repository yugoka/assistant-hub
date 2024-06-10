import { getThreadByID, getThreads } from "./../../../services/threads";
import {
  CreateThreadInput,
  GetThreadByIDOptions,
  GetThreadsOptions,
  createThread,
} from "@/services/threads";
import { NextResponse } from "next/server";

export const runtime = "edge";

// スレッド取得
// フロントではあんまり使わないかも
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const threadID = url.searchParams.get("thread_id");
    const userID = url.searchParams.get("user_id");

    if (!threadID && !userID) {
      return new Response(
        JSON.stringify({ error: "Neither thread_id nor user_id specified" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (threadID) {
      const result = await getThreadByID({
        threadID,
      });

      const res = NextResponse.json(result, { status: 200 });
      return res;
    } else if (userID) {
      const result = await getThreads({ userId: userID });
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

// スレッド作成
export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    const params: CreateThreadInput = {
      name: reqBody.name,
      user_id: reqBody.user_id,
    };
    if (reqBody.id) {
      params.id = reqBody.id;
    }

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
