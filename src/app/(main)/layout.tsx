import NavMenu from "@/components/layout/main/NavMenu/NavMenu";
import { MainLayoutHeader } from "@/components/layout/main/Header";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import QueryProviderWrapper from "@/contexts/QueryContext";
import UserProviderWrapper from "@/contexts/UserContext";
import { ReactNode } from "react";
import SettingsProviderWrapper from "@/contexts/SettingsContext";
import TooltipProviderWrapper from "@/contexts/TooltipProviderWrapper";
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
      <UserProviderWrapper user={user} error={error}>
        <SettingsProviderWrapper>
          <TooltipProviderWrapper>
            <div className="flex flex-col h-screen w-full">
              <MainLayoutHeader />
              <div className="flex h-[calc(100svh-49px)] md:h-full w-full">
                <div className="hidden w-64 shrink-0 border-r bg-gray-100 dark:border-gray-800 dark:bg-gray-900 md:block">
                  <div className="flex h-full flex-col justify-between pt-6">
                    <NavMenu />
                  </div>
                </div>
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </div>
          </TooltipProviderWrapper>
        </SettingsProviderWrapper>
      </UserProviderWrapper>
    </QueryProviderWrapper>
  );
}
