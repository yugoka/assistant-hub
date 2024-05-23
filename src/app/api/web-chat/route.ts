import { runResponderAgent } from "@/app/assistant/agents/responderAgent";
import { AssistantAPIParam } from "@/types/api/Assistant";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";

//============
// useChat()用API
//============
export const runtime = "edge";
export async function POST(request: NextRequest) {
  try {
    const params: AssistantAPIParam = await request.json();
    const response = await runResponderAgent(params);

    return new StreamingTextResponse(response);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
