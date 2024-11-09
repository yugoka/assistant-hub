import { ExecutorFunction } from "@/services/schema/openapiToTools";
import { Tool } from "@/types/Tool";
import axios, { AxiosRequestConfig, Method } from "axios";

/**
 * API呼び出しを実行する関数
 * @param args - API呼び出しの引数
 * @param method - HTTPメソッド
 * @param path - APIのパス
 * @param serverUrl - サーバーのURL
 * @param customHeaders - カスタムヘッダー（オプショナル）
 * @returns API呼び出しの結果
 */
export async function executeApiCall(
  args: Record<string, any>,
  method: string,
  path: string,
  serverUrl: string,
  customHeaders?: Record<string, string>
): Promise<any> {
  try {
    let url = `${serverUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
    const config: AxiosRequestConfig = {
      method: method.toUpperCase() as Method,
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
    };

    // パスパラメータの置換
    for (const [key, value] of Object.entries(args)) {
      if (url.includes(`{${key}}`)) {
        url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
        delete args[key];
      }
    }
    console.log(`[ToolExecutor] ${method} ${url}`);

    // クエリパラメータの追加またはリクエストボディの設定
    if (["GET", "DELETE"].includes(method.toUpperCase())) {
      config.params = args;
    } else {
      config.data = args;
    }

    const response = await axios(url, config);

    return response.data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return { error: `HTTP Error! Execution Failed: ${e.message}` };
    }
    return { error: `Error! Execution Failed: ${e}` };
  }
}

export function getExecutor(
  method: string,
  path: string,
  serverUrl: string,
  customHeaders?: Record<string, string>
): ExecutorFunction {
  return async (argsString: string) => {
    try {
      const args = JSON.parse(argsString);
      return executeApiCall(args, method, path, serverUrl, customHeaders);
    } catch (e) {
      return `Failed to parse args JSON: ${e}`;
    }
  };
}

/**
 * Generates custom headers based on the Tool's authentication type and credential.
 * @param tool - The Tool object containing authentication info.
 * @returns An object representing custom headers or undefined.
 */
export function getCustomHeaders(
  tool: Tool
): Record<string, string> | undefined {
  switch (tool.auth_type) {
    case "None":
      return undefined;

    case "Bearer":
      if (tool.credential) {
        // Return the Authorization header with the Bearer token
        return { Authorization: `Bearer ${tool.credential}` };
      } else {
        throw new Error("Bearer token is missing in tool credential.");
      }

    case "Custom Header":
      if (tool.credential) {
        try {
          // Parse the credential JSON string into an object
          const headers = JSON.parse(tool.credential);
          if (typeof headers === "object" && headers !== null) {
            return headers as Record<string, string>;
          } else {
            throw new Error("Custom headers credential is not a valid object.");
          }
        } catch (error) {
          throw new Error("Invalid JSON in custom headers credential.");
        }
      } else {
        throw new Error("Custom headers are missing in tool credential.");
      }

    default:
      throw new Error(`Unsupported auth_type: ${tool.auth_type}`);
  }
}
