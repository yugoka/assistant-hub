"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import NavMenu from "./NavMenu/NavMenu";
import { useState } from "react";

export function MainLayoutHeaderSheet() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Sheet open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <SheetTrigger asChild>
        <Button size="icon" variant="link">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <NavMenu onMobileMenuClose={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
