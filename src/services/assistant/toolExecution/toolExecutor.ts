import { ExecutorFunction } from "./openapiToTools";

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
  let url = `${serverUrl}${path}`;
  const fetchConfig: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      ...customHeaders, // カスタムヘッダーを追加
    },
  };

  // パスパラメータの置換
  for (const [key, value] of Object.entries(args)) {
    if (url.includes(`{${key}}`)) {
      url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
      delete args[key];
    }
  }

  // クエリパラメータの追加またはリクエストボディの設定
  if (["GET", "DELETE"].includes(method.toUpperCase())) {
    const queryParams = new URLSearchParams(args).toString();
    url += queryParams ? `?${queryParams}` : "";
  } else {
    fetchConfig.body = JSON.stringify(args);
  }

  const response = await fetch(url, fetchConfig);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export function getExecutor(
  method: string,
  path: string,
  serverUrl: string
): ExecutorFunction {
  return async (argsString: string, customHeadersString?: string) => {
    const args = JSON.parse(argsString);
    const customHeaders = customHeadersString
      ? JSON.parse(customHeadersString)
      : undefined;
    return executeApiCall(args, method, path, serverUrl, customHeaders);
  };
}
