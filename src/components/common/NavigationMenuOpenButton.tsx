"use client";
import { MenuIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigation } from "@/contexts/NavigaitonContext";

export function NavigationMenuOpenButton({
  className = "",
}: {
  className?: string;
}) {
  const { setIsOpen } = useNavigation();

  return (
    <Button
      size="icon"
      variant="link"
      className={className}
      onClick={() => setIsOpen(true)}
    >
      <MenuIcon className="h-6 w-6" />
      <span className="sr-only">Toggle navigation menu</span>
    </Button>
  );
}
