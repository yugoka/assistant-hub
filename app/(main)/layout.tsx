import NavMenu from "@/components/layout/main/NavMenu/NavMenu";
import { MainLayoutHeader } from "@/components/layout/main/Header";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <MainLayoutHeader />
      <div className="flex h-[calc(100vh-49px)] md:h-full w-full">
        <div className="hidden w-64 shrink-0 border-r bg-gray-100 dark:border-gray-800 dark:bg-gray-900 md:block">
          <div className="flex h-full flex-col justify-between py-6">
            <NavMenu />
          </div>
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
