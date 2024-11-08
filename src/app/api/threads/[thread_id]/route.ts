import {
  UpdateThreadInput,
  deleteThread,
  getThreadByID,
  updateThread,
} from "@/services/threads";
import { NextResponse } from "next/server";

// ==============
// スレッド取得 (by id)
// ==============
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

// ==============
// スレッド更新
// ==============
export async function PUT(
  req: Request,
  { params }: { params: { thread_id: string } }
) {
  try {
    const reqBody = await req.json();

    const updateParams: UpdateThreadInput = {
      id: params.thread_id,
      name: reqBody.name,
      memory: reqBody.memory,
      maximum_memory_tokens: reqBody.maximum_memory_tokens,
      enable_memory: reqBody.enable_memory,
      system_prompt: reqBody.system_prompt,
      starred: reqBody.starred,
      maximum_initial_input_tokens: reqBody.maximum_initial_input_tokens,
      model_name: reqBody.model_name,
    };

    if (!params.thread_id) {
      return new Response(
        JSON.stringify({ error: "Bad Request: thread id is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const result = await updateThread(updateParams);
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
// スレッド削除
// ==============
export async function DELETE(
  req: Request,
  { params }: { params: { thread_id: string } }
) {
  try {
    if (!params.thread_id) {
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

    await deleteThread({ id: params.thread_id });
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
