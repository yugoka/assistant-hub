import { getMessagesByThreadID } from "@/services/messages";
import { Message } from "@/types/Message";
import { NextResponse } from "next/server";
export const runtime = "edge";

export async function GET(req: Request) {
  try {
    // リクエストURLからクエリパラメーターを取得
    const url = new URL(req.url);

    const threadID = url.searchParams.get("thread_id");
    const pageParam = parseInt(url.searchParams.get("page") || "");
    const page = isNaN(pageParam) ? undefined : pageParam;
    const pageSizeParam = parseInt(url.searchParams.get("page_size") || "");
    const pageSize = isNaN(pageSizeParam) ? undefined : pageSizeParam;

    if (threadID) {
      // thread_idが存在する場合のレスポンス
      const responseData: Message[] = await getMessagesByThreadID({
        threadID,
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
