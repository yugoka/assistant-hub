import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { MouseEvent, ReactNode } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: (event: MouseEvent) => void;
};

export default function NewButton({ children, href, onClick }: Props) {
  const buttonBase = (
    <Button
      variant="outline"
      className="w-full flex h-9 justify-start"
      onClick={onClick}
    >
      <PlusIcon className="w-5 me-2" />
      <span>{children}</span>
    </Button>
  );

  if (href) {
    return <Link href={href}>{buttonBase}</Link>;
  } else {
    return buttonBase;
  }
}
