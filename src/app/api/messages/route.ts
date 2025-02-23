import { createMessage, getMessagesByThreadID } from "@/services/messages";
import { Message } from "@/types/Message";
import { NextResponse } from "next/server";
export const runtime = "edge";

// メッセージ作成
// 結果や呼び出し元が欠けているtoolCallなど、ログを崩壊させるデータも挿入できてしまうため注意
// TODO: RLSなどで入力をバリデーションする
export async function POST(req: Request) {
  try {
    const reqBody = await req.json();

    const params: Message = {
      id: reqBody.id,
      thread_id: reqBody.thread_id,
      role: reqBody.role,
      content: reqBody.content,
      created_at: reqBody.created_at,
      name: reqBody.name,
      tool_calls: reqBody.tool_calls,
    };

    const result = await createMessage(params);
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

// メッセージ取得
export async function GET(req: Request) {
  try {
    // リクエストURLからクエリパラメーターを取得
    const url = new URL(req.url);

    const threadId = url.searchParams.get("thread_id");
    const pageParam = parseInt(url.searchParams.get("page") || "");
    const page = isNaN(pageParam) ? undefined : pageParam;
    const pageSizeParam = parseInt(url.searchParams.get("page_size") || "");
    const pageSize = isNaN(pageSizeParam) ? undefined : pageSizeParam;

    if (threadId) {
      // thread_idが存在する場合のレスポンス
      const responseData: Message[] = await getMessagesByThreadID({
        threadId,
        page,
        pageSize,
      });
      return NextResponse.json(responseData, { status: 200 });
    } else {
      // thread_idが存在しない場合のレスポンス
      const errorResponse = { error: "Thread ID not provided" };
      return NextResponse.json(errorResponse, { status: 400 });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    const errorResponse = { error: "Internal Server Error" };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
