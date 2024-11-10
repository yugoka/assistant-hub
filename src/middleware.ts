import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export const middleware = async (request: NextRequest) => {
  try {
    // ヘッダーをクローン
    const requestHeaders = new Headers(request.headers);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const jwtSecret = process.env.SUPABASE_JWT_SECRET!;

    // サービスロールキーを使用してSupabaseクライアントを作成
    const supabaseAdmin = createServerClient(supabaseUrl, supabaseServiceKey, {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            requestHeaders.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            )
          );
        },
      },
    });

    // JWTが既に存在するかチェック
    const authHeader = request.headers.get("Authorization");
    const hasJWT =
      request.cookies.get("sb-access-token") ||
      (authHeader && authHeader.startsWith("Bearer "));

    if (!hasJWT) {
      // サービスAPIキーをヘッダーから取得
      const serviceApiKey = request.headers.get("x-service-api-key");
      if (serviceApiKey) {
        // authenticate_api_key関数を呼び出してユーザーIDを取得
        const { data: userId, error } = await supabaseAdmin.rpc(
          "authenticate_api_key",
          {
            api_key: serviceApiKey,
          }
        );

        if (error || !userId) {
          // 認証失敗
          return new NextResponse("Invalid API Key", { status: 401 });
        }

        // JWTペイロードを作成
        const payload = {
          sub: userId,
          aud: "authenticated",
          role: "authenticated",
        };

        // JWTを生成
        const token = await new SignJWT(payload)
          .setExpirationTime("1h")
          .setProtectedHeader({ alg: "HS256" })
          .sign(new TextEncoder().encode(jwtSecret));

        // ヘッダーの更新
        requestHeaders.set("Authorization", `Bearer ${token}`);

        // 更新したヘッダーをレスポンスに含める
        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });

        // クッキーにJWTを設定（必要に応じて）
        response.cookies.set("sb-access-token", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        // リクエストを続行
        return response;
      }
    }

    // JWTが既に存在する場合、またはサービスAPIキーがない場合は通常の処理を続行
    return NextResponse.next();
  } catch (e) {
    // エラーハンドリング
    console.error("Error in middleware:", e);
    return NextResponse.next();
  }
};

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
