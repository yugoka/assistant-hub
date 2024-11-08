import { NavigationMenuOpenButton } from "@/components/common/NavigationMenuOpenButton";
import HeaderBase from "@/components/layout/HeaderBase";
import { ReactNode } from "react";
export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-full w-full relative md:pt-0">
      <HeaderBase className="md:hidden">
        <div className="flex justify-between items-center">
          <NavigationMenuOpenButton />
        </div>
      </HeaderBase>
      {children}
    </div>
  );
}
