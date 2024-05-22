import { runResponderAgent } from "@/app/assistant/agents/responderAgent";
import { StreamingTextResponse } from "ai";

//============
// 外部用API
//============

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await runResponderAgent(messages);
  const clientStream = response.toReadableStream();

  // クライアントにストリームを返す
  return new StreamingTextResponse(clientStream);
}
