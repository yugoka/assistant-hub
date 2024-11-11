import { CookieMethodsServer, createServerClient } from "@supabase/ssr";
import { SupabaseClientOptions } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";

export const createClient = () => {
  const cookieStore = cookies();
  const headersStore = headers();

  const createServerClientOptions: SupabaseClientOptions<"public"> & {
    cookies: CookieMethodsServer;
  } = {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (e) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },

    global: {
      headers: {},
    },
  };

  // 外部API用に作成されたjwt
  const authToken = headersStore.get("Authorization");
  if (authToken) {
    createServerClientOptions.global = {
      headers: {
        Authorization: authToken,
      },
    };
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    createServerClientOptions
  );
};
