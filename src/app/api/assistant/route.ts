import { runResponderAgent } from "@/app/assistant/agents/responderAgent";
import { AssistantAPIParam } from "@/types/api/Assistant";
import { StreamingTextResponse } from "ai";

//============
// 外部用API
//============
export const runtime = "edge";

export async function POST(req: Request) {
  const params: AssistantAPIParam = await req.json();

  const response = await runResponderAgent(params);

  // クライアントにストリームを返す
  return new StreamingTextResponse(response);
}
