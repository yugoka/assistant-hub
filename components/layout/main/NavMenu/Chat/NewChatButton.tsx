import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function NewChatButton() {
  const supabase = createClient();

  const handleClick = () => {};

  return (
    <Button variant="outline" className="w-full flex h-9 justify-start">
      <PlusIcon className="w-5 me-2" />
      <span>New Chat</span>
    </Button>
  );
}
