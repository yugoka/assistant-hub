"use client";
import { BrandIcon } from "@/components/common/BrandIcon";
import { HomeIcon, MessageSquareTextIcon, WandSparkles } from "lucide-react";
import Link from "next/link";
import NavMenuDropDown from "./NavMenuDropDown";
import React from "react";
import { usePathname } from "next/navigation";

export type NavMenuMode = {
  name: string;
  icon: React.ReactNode;
  pathname: string;
};

const navMenuChatMode = {
  name: "Chat",
  icon: <MessageSquareTextIcon />,
  pathname: "/chat",
};
const navMenuToolsMode = {
  name: "Tools",
  icon: <WandSparkles />,
  pathname: "/tools",
};

export const navMenuModes: NavMenuMode[] = [navMenuChatMode, navMenuToolsMode];

export default function NavMenu() {
  const pathName = usePathname();

  // 非効率なループを回しているが項目数が小規模なので許容
  const getCurrentMenuMode = () =>
    navMenuModes.find((mode) => pathName.startsWith(mode.pathname)) ||
    navMenuChatMode;

  const [currentNavMenuMode, setCurrentNavMenuMode] =
    React.useState<NavMenuMode>(getCurrentMenuMode());

  React.useEffect(() => {
    setCurrentNavMenuMode(getCurrentMenuMode());
  }, [pathName]);

  return (
    <div>
      <div className="flex flex-col px-4 pb-2 border-b dark:border-gray-800">
        <Link className="mx-auto mb-2 flex items-center" href="#">
          <BrandIcon className="h-6 w-6 mr-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Assistant Hub
          </span>
        </Link>
        <div className="flex justify-center">
          <NavMenuDropDown
            currentNavMenuMode={currentNavMenuMode}
            setCurrentNavMenuMode={setCurrentNavMenuMode}
            navMenuModes={navMenuModes}
          />
        </div>
      </div>

      <nav className="space-y-1 px-4 py-3">
        <Link
          className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
          href="#"
        >
          <HomeIcon className="mr-3 h-5 w-5" />
          Home
        </Link>
      </nav>
    </div>
  );
}
