import ChatBubble from "@/components/chat/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex h-full max-h-screen flex-col w-full">
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 max-w-2xl mx-auto">
          <ChatBubble
            username="User"
            variant="user"
            content="こんにちはaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
            timestamp={new Date()}
          />
          <ChatBubble
            username="AI"
            variant="ai"
            content="こんにちは"
            timestamp={new Date()}
          />
        </div>
      </div>
      <div className="border-t bg-gray-100 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <Input
            className="flex-1 h-12"
            placeholder="Type your message..."
            type="text"
          />
          <Button>Send</Button>
        </div>
      </div>
    </div>
  );
}
