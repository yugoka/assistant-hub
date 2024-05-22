import { runResponderAgent } from "@/app/assistant/agents/responderAgent";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";

//============
// useChat()用API
//============
export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const response = await runResponderAgent(messages);

    const clientStream = OpenAIStream(response);
    return new StreamingTextResponse(clientStream);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
