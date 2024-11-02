import { ExecutorFunction } from "@/services/schema/openapiToTools";
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
    let url = `${serverUrl}${path}`;
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
  serverUrl: string
): ExecutorFunction {
  return async (argsString: string, customHeadersString?: string) => {
    console.log(JSON.parse(argsString));
    const args = JSON.parse(argsString);
    const customHeaders = customHeadersString
      ? JSON.parse(customHeadersString)
      : undefined;
    return executeApiCall(args, method, path, serverUrl, customHeaders);
  };
}
