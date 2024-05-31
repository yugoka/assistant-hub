import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function NewChatButton() {
  return (
    <Link className="w-full" href="/chat">
      <Button variant="outline" className="w-full flex h-9 justify-start">
        <PlusIcon className="w-5 me-2" />
        <span>New Chat</span>
      </Button>
    </Link>
  );
}
