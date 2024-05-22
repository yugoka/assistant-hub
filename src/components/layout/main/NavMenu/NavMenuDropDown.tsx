import Link from "next/link";
import {
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import {
  ChevronsUpDownIcon,
  MessageSquareTextIcon,
  WandSparkles,
} from "lucide-react";
import { NavMenuMode } from "./NavMenu";
import { Button } from "@/components/ui/button";

type Props = {
  currentNavMenuMode: NavMenuMode;
  setCurrentNavMenuMode: React.Dispatch<React.SetStateAction<NavMenuMode>>;
  navMenuModes: NavMenuMode[];
};

export default function NavMenuDropDown({
  navMenuModes,
  currentNavMenuMode,
  setCurrentNavMenuMode,
}: Props) {
  // 基本的にはリンクの変更で自動的にモードが切り替わるが、
  // 直接ドロップダウン経由でモードを変更した場合は視覚上の反映を早くするために
  // setCurrentNavMenuModeを使っている
  const handleLinkClick = (mode: NavMenuMode) => {
    setCurrentNavMenuMode(mode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-md border px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50">
        <div className="flex items-center gap-2">
          <span className="w-5">{currentNavMenuMode.icon}</span>
          {currentNavMenuMode.name}
        </div>
        <ChevronsUpDownIcon className="grow-0h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {navMenuModes.map((mode) => (
          <Link
            key={mode.name}
            href={mode.pathname}
            onClick={() => handleLinkClick(mode)}
          >
            <DropdownMenuItem>
              <span className="w-5 me-2">{mode.icon}</span>
              {mode.name}
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
