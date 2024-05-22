import { runResnponderAgent } from "@/app/assistant/agents/responderAgent";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // request bodyはそのまま渡す
    const { messages } = await request.json();
    const response = await runResnponderAgent(messages);

    const clientStream = OpenAIStream(response);
    return new StreamingTextResponse(clientStream);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
