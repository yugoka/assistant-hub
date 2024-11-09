import yaml from "js-yaml";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { ChatCompletionTool } from "openai/resources";
import { Resolver } from "@stoplight/json-ref-resolver";
import { Tool } from "@/types/Tool";
import {
  getCustomHeaders,
  getExecutor,
} from "../assistant/toolExecution/toolExecutor";
const resolver = new Resolver();

export type ExecutorFunction = (
  argsString: string,
  customHeadersString?: string
) => Promise<any>;

export type OpenAIToolWithExecutor = ChatCompletionTool & {
  path: string;
  method: string;
  operationId?: string;
  baseTool: Tool;
  execute: ExecutorFunction;
};

function parseOpenapiSpec(
  openapiSpec: string | object
): OpenAPIV3.Document | OpenAPIV3_1.Document {
  if (typeof openapiSpec === "string") {
    try {
      return JSON.parse(openapiSpec);
    } catch (e) {
      return yaml.load(openapiSpec) as
        | OpenAPIV3.Document
        | OpenAPIV3_1.Document;
    }
  }
  return openapiSpec as OpenAPIV3.Document | OpenAPIV3_1.Document;
}

function generateRandomToolId(length: number = 5): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
}

function isOperationObject(obj: any): obj is OpenAPIV3.OperationObject {
  return typeof obj === "object" && obj !== null && "responses" in obj;
}

function processToolParameters(operation: OpenAPIV3.OperationObject) {
  const parameters = {
    type: "object",
    properties: {} as Record<string, any>,
    required: [] as string[],
  };

  if (operation.parameters) {
    for (const param of operation.parameters) {
      if ("schema" in param && param.schema && "type" in param.schema) {
        parameters.properties[param.name] = {
          type: param.schema.type,
          description: param.description || "",
        };
        if (param.required) {
          parameters.required.push(param.name);
        }
      }
    }
  }

  if (
    operation.requestBody &&
    "content" in operation.requestBody &&
    operation.requestBody.content &&
    operation.requestBody.content["application/json"]
  ) {
    const schema = operation.requestBody.content["application/json"].schema;
    if (schema && "properties" in schema) {
      Object.assign(parameters.properties, schema.properties);
      if (schema.required) {
        parameters.required.push(...schema.required);
      }
    }
  }

  return parameters;
}

// DB上のツールからOpenAI Toolsに変換
// 名前が分かりづらいのでどうにかしたい
export async function convertRegisteredToolsToOpenAITools(
  inputTool: Tool
): Promise<OpenAIToolWithExecutor[]> {
  const openapiSpec = inputTool.schema;
  try {
    const specObject = parseOpenapiSpec(openapiSpec);
    const resolved = await resolver.resolve(specObject);
    const spec = resolved.result as OpenAPIV3.Document;

    if (!spec.servers || spec.servers.length === 0) {
      throw new Error("No server URL found in the OpenAPI schema");
    }

    const serverUrl = spec.servers[0].url;
    const usedNames = new Set<string>();
    const tools: OpenAIToolWithExecutor[] = [];

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      if (!pathItem) continue;
      for (const [method, operation] of Object.entries(pathItem)) {
        if (!isOperationObject(operation) || method === "parameters") continue;

        let uniqueName;
        do {
          uniqueName = generateRandomToolId();
        } while (usedNames.has(uniqueName));
        usedNames.add(uniqueName);

        const tool: OpenAIToolWithExecutor = {
          type: "function",
          function: {
            name: uniqueName,
            description: `${method.toUpperCase()} ${path}: ${
              operation.summary || operation.description || ""
            }`,
            parameters: processToolParameters(operation),
          },
          path,
          method,
          operationId: operation.operationId,
          execute: getExecutor(
            method,
            path,
            serverUrl,
            getCustomHeaders(inputTool)
          ),
          baseTool: inputTool,
        };

        tools.push(tool);
      }
    }

    return tools;
  } catch (error) {
    console.error("Error converting OpenAPI to tools:", error);
    throw error;
  }
}
