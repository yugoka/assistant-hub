import {
  getApikeyByID,
  updateApikey,
  deleteApikey,
  UpdateApikeyInput,
} from "@/services/apikeys";
import { NextResponse } from "next/server";
export const runtime = "edge";

// ==============
// APIキー取得 (by id)
// ==============
export async function GET(
  req: Request,
  { params }: { params: { apikey_id: string } }
) {
  try {
    const apikeyID = parseInt(params.apikey_id, 10);

    if (isNaN(apikeyID)) {
      return new Response(
        JSON.stringify({
          error: "Bad Request: apikey_id is required and must be a number",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const result = await getApikeyByID({ id: apikeyID });

    if (result === null) {
      return new Response(
        JSON.stringify({
          error:
            "The API key either does not exist or you are attempting to access a resource that is not accessible with the provided API key.",
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
// APIキー更新
// ==============
export async function PUT(
  req: Request,
  { params }: { params: { apikey_id: string } }
) {
  try {
    const reqBody = await req.json();
    const apikeyID = parseInt(params.apikey_id, 10);

    if (isNaN(apikeyID)) {
      return new Response(
        JSON.stringify({
          error: "Bad Request: apikey_id is required and must be a number",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const updateParams: UpdateApikeyInput = {
      id: apikeyID,
      name: reqBody.name,
      mode: reqBody.mode,
    };

    const result = await updateApikey(updateParams);
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
// APIキー削除
// ==============
export async function DELETE(
  req: Request,
  { params }: { params: { apikey_id: string } }
) {
  try {
    const apikeyID = parseInt(params.apikey_id, 10);

    if (isNaN(apikeyID)) {
      return new Response(
        JSON.stringify({
          error: "Bad Request: apikey_id is required and must be a number",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    await deleteApikey({ id: apikeyID });
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
