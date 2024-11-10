import { createApikey, getApikeyByID, getApikeys } from "@/services/apikeys";
import { NextResponse } from "next/server";

export const runtime = "edge";

// ==============
// APIキー作成
// ==============
export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    const params = {
      name: reqBody.name,
      mode: reqBody.mode,
    };

    const result = await createApikey(params);
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
// APIキー取得
// ==============
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const apikeyID = url.searchParams.get("apikey_id");
    const userID = url.searchParams.get("user_id");
    const page = url.searchParams.get("page");
    const pageSize = url.searchParams.get("pageSize");

    if (apikeyID) {
      const result = await getApikeyByID({ id: Number(apikeyID) });
      const res = NextResponse.json(result, { status: 200 });
      return res;
    } else {
      const result = await getApikeys({
        userId: userID || undefined,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
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
