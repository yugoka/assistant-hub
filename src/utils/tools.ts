import { OpenAIToolWithoutExecutor } from "@/services/schema/openapiToTools";

export const executeTool = async (
  tool: OpenAIToolWithoutExecutor,
  args: any
): Promise<string> => {
  const url = `/api/tools/${tool.baseTool.id}/execute`;
  const path = tool.path;
  const method = tool.method;

  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      arguments: JSON.stringify(args),
      path: path,
      method: method,
    }),
  });

  const result = await res.json();
  console.log(result);
  return result;
};
