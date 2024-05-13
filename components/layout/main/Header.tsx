import { BrandIcon } from "@/components/common/BrandIcon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import NavMenu from "./NavMenu/NavMenu";
import Link from "next/link";

export function MainLayoutHeader() {
  return (
    <header className="bg-gray-100 dark:bg-gray-900 border-b dark:border-gray-800 md:hidden shrink-0 grow-0">
      <div className="flex items-center justify-between h-12 px-4 sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="link">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <NavMenu />
          </SheetContent>
        </Sheet>
        <Link className="flex items-center" href="#">
          <BrandIcon className="h-6 w-6 mr-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Assistant Hub
          </span>
        </Link>
        <div className="w-6"></div>
      </div>
    </header>
  );
}
