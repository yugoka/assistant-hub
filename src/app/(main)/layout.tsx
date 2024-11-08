import NavMenu from "@/components/layout/main/NavMenu/NavMenu";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import QueryProviderWrapper from "@/contexts/QueryContext";
import UserProvider from "@/contexts/UserContext";
import { ReactNode } from "react";
import SettingsProvider from "@/contexts/SettingsContext";
import TooltipProviderWrapper from "@/contexts/TooltipProviderWrapper";
import { NavigationProvider } from "@/contexts/NavigaitonContext";
export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <QueryProviderWrapper>
      <UserProvider user={user} error={error}>
        <SettingsProvider>
          <NavigationProvider>
            <TooltipProviderWrapper>
              <div className="flex flex-col h-dvh w-full">
                <div className="flex h-dvh md:h-full w-full">
                  <div className="hidden w-64 shrink-0 border-r bg-gray-100 dark:border-gray-800 dark:bg-gray-900 md:block">
                    <div className="flex h-full flex-col justify-between pt-6">
                      <NavMenu />
                    </div>
                  </div>
                  <main className="flex-1 overflow-auto">{children}</main>
                </div>
              </div>
            </TooltipProviderWrapper>
          </NavigationProvider>
        </SettingsProvider>
      </UserProvider>
    </QueryProviderWrapper>
  );
}
