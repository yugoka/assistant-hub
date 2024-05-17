import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function NewChatButton() {
  const handleClick = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const result = await supabase.from("Threads").insert({
        user_id: user.id,
      });
      console.log(result);
    } else {
      throw new Error("No user found");
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex h-9 justify-start"
      onClick={handleClick}
    >
      <PlusIcon className="w-5 me-2" />
      <span>New Chat</span>
    </Button>
  );
}
