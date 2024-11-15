import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export const middleware = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("Authorization");
    const hasJWT =
      request.cookies.get("sb-access-token") ||
      (authHeader && authHeader.startsWith("Bearer "));

    if (hasJWT) {
      return await handleExistingJWT(request);
    } else {
      return await handleServiceAPIKey(request);
    }
  } catch (e) {
    console.error("ミドルウェアでエラーが発生しました:", e);
    return NextResponse.next({ request });
  }
};

const handleExistingJWT = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ユーザーが見つからない場合、ログインページにリダイレクト
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
};

const handleServiceAPIKey = async (request: NextRequest) => {
  const requestHeaders = new Headers(request.headers);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const jwtSecret = process.env.SUPABASE_JWT_SECRET!;

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

  const serviceApiKey = request.headers.get("x-service-api-key");
  if (serviceApiKey) {
    const { data: userId, error } = await supabaseAdmin.rpc(
      "authenticate_api_key",
      { api_key: serviceApiKey }
    );

    if (error || !userId) {
      return new NextResponse("Invalid API Key", { status: 401 });
    }

    const payload = {
      sub: userId,
      aud: "authenticated",
      role: "authenticated",
    };

    const token = await new SignJWT(payload)
      .setExpirationTime("1h")
      .setProtectedHeader({ alg: "HS256" })
      .sign(new TextEncoder().encode(jwtSecret));

    // ヘッダーを新しいJWTで更新
    requestHeaders.set("Authorization", `Bearer ${token}`);

    const response = NextResponse.next({
      request: {
        ...request,
        headers: requestHeaders,
      },
    });

    response.cookies.set("sb-access-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  }

  // サービスAPIキーがない場合エラー
  return NextResponse.json(
    {
      error:
        "API key is missing. Please set the API key in the header x-service-api-key.",
    },
    { status: 401 }
  );
};

export const config = {
  matcher: [
    /*
     * 除外するパス:
     * - _next/static（静的ファイル）
     * - _next/image（画像最適化ファイル）
     * - favicon.ico
     * - 画像ファイル（.svg, .png, .jpg, .jpeg, .gif, .webp）
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
