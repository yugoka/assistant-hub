import NavMenu from "@/components/layout/main/NavMenu/NavMenu";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import QueryProviderWrapper from "@/contexts/QueryContext";
import UserProvider from "@/contexts/UserContext";
import { ReactNode } from "react";
import SettingsProvider from "@/contexts/SettingsContext";
import TooltipProviderWrapper from "@/contexts/TooltipProviderWrapper";
import {
  NavigationProvider,
  SharedNavMenu,
} from "@/contexts/NavigaitonContext";
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
                  <SharedNavMenu>
                    <NavMenu />
                  </SharedNavMenu>
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
