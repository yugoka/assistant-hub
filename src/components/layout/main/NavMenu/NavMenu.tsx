"use client";
import { MessageSquareTextIcon, SettingsIcon } from "lucide-react";
import NavMenuDropDown from "./NavMenuDropDown";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ChatNavigation from "./Chat/ChatNavigation";
import { ToolIcon } from "@/components/common/icons/ToolIcon";
import ToolsNavigation from "./Tools/ToolsNavigation";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";

export type NavMenuMode = {
  name: string;
  icon: ReactNode;
  pathname: string;
};

const navMenuChatMode = {
  name: "Chat",
  icon: <MessageSquareTextIcon />,
  pathname: "/chat",
};
const navMenuToolsMode = {
  name: "Tools",
  icon: <ToolIcon />,
  pathname: "/tools",
};

export const navMenuModes: NavMenuMode[] = [navMenuChatMode, navMenuToolsMode];

type Props = {
  onMobileMenuClose?: () => void;
};

export default function NavMenu({ onMobileMenuClose }: Props) {
  const pathName = usePathname();

  const { setIsSettingsMenuOpen } = useSettings();

  // 非効率なループを回しているが項目数が小規模なので許容
  const getCurrentMenuMode = () =>
    navMenuModes.find((mode) => pathName.startsWith(mode.pathname)) ||
    navMenuChatMode;

  const [currentNavMenuMode, setCurrentNavMenuMode] = useState<NavMenuMode>(
    getCurrentMenuMode()
  );

  useEffect(() => {
    setCurrentNavMenuMode(getCurrentMenuMode());
  }, [pathName]);

  return (
    <div className="flex flex-col h-full min-w-32">
      <div className="flex flex-col px-4 py-3 border-b dark:border-gray-800">
        <div className="flex justify-center">
          <div className="grow shrink">
            <NavMenuDropDown
              currentNavMenuMode={currentNavMenuMode}
              setCurrentNavMenuMode={setCurrentNavMenuMode}
              navMenuModes={navMenuModes}
            />
          </div>
        </div>
      </div>

      {/* 
      ここから下のエリアはタップ時にメニューを閉じる(モバイル版)
      今後チューニングが必要であればバケツリレーするかproviderで対応
      */}
      <div
        className="flex flex-col flex-grow flex-shrink h-56"
        onClick={onMobileMenuClose}
      >
        {currentNavMenuMode === navMenuChatMode ? (
          <ChatNavigation />
        ) : currentNavMenuMode === navMenuToolsMode ? (
          <ToolsNavigation />
        ) : (
          <></>
        )}

        <div>
          <Button
            variant="ghost"
            className="mb-2 mx-2 flex text-gray-600 dark:text-gray-500 hover:text-gray-500 transition-colors flex-shrink-0"
            onClick={() => setIsSettingsMenuOpen(true)}
          >
            <SettingsIcon className="w-5 h-5 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
