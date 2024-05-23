import { runResponderAgent } from "@/app/assistant/agents/responderAgent";
import { AssistantAPIParam } from "@/types/api/Assistant";

//============
// 外部用API
//============
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const params: AssistantAPIParam = await req.json();
    const responseStream = await runResponderAgent(params);

    // ストリームをそのままレスポンスとして返す
    return new Response(responseStream, {
      headers: {
        "Content-Type": "application/json",
      },
    });
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
