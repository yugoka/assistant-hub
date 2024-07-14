import yaml from "js-yaml";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import SwaggerParser from "@apidevtools/swagger-parser";
import { getExecutor } from "./toolExecutor";
import { ChatCompletionTool } from "openai/resources";

export type ExecutorFunction = (
  argsString: string,
  customHeadersString?: string
) => Promise<any>;

export type ToolWithExecutor = ChatCompletionTool & {
  path: string;
  method: string;
  originalName: string;
  execute: ExecutorFunction;
};

/**
 * OpenAPI仕様をパースする関数
 * @param openapiSpec - 文字列または既にパースされたオブジェクトとしてのOpenAPI仕様
 * @returns パースされたOpenAPI仕様オブジェクト
 */
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

/**
 * ランダムなツールIDを生成する関数
 * @param length - 生成するIDの長さ（デフォルト: 5）
 * @returns 生成されたID
 */
function generateRandomToolId(length: number = 5): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
}

/**
 * オブジェクトがOperationObjectかどうかを判定する型ガード関数
 * @param obj - 判定対象のオブジェクト
 * @returns オブジェクトがOperationObjectであればtrue
 */
function isOperationObject(obj: any): obj is OpenAPIV3.OperationObject {
  return typeof obj === "object" && obj !== null && "responses" in obj;
}

/**
 * ツールのパラメータを処理する関数
 * @param operation - OpenAPI操作オブジェクト
 * @returns 処理されたパラメータオブジェクト
 */
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

/**
 * OpenAPIスキーマをツールオブジェクトに変換する関数
 * @param openapiSpec - OpenAPI仕様（文字列またはオブジェクト）
 * @returns 変換されたツールオブジェクトの配列
 */
export async function convertOpenAPIToTools(
  openapiSpec: string | object
): Promise<ToolWithExecutor[]> {
  try {
    const specObject = parseOpenapiSpec(openapiSpec);
    const spec = (await SwaggerParser.dereference(
      specObject
    )) as OpenAPIV3.Document;

    if (!spec.servers || spec.servers.length === 0) {
      throw new Error("No server URL found in the OpenAPI schema");
    }

    const serverUrl = spec.servers[0].url;
    const usedNames = new Set<string>();
    const tools: ToolWithExecutor[] = [];

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      if (!pathItem) continue;
      for (const [method, operation] of Object.entries(pathItem)) {
        if (!isOperationObject(operation) || method === "parameters") continue;

        let uniqueName;
        do {
          uniqueName = generateRandomToolId();
        } while (usedNames.has(uniqueName));
        usedNames.add(uniqueName);

        const tool: ToolWithExecutor = {
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
          originalName: operation.operationId || `${method}-${path}`,
          execute: getExecutor(method, path, serverUrl),
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
