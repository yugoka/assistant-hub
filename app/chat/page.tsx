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
    <div className="flex h-screen max-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-gray-100 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <div className="text-lg font-medium">Chat with Jane</div>
        <Button className="rounded-full" size="icon" variant="ghost">
          <XIcon className="h-5 w-5" />
          <span className="sr-only">Close chat</span>
        </Button>
      </header>
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4">
          <div className="flex justify-end">
            <div className="max-w-[80%] space-y-1">
              <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm dark:bg-gray-800">
                Hey there! How can I help you today?
              </div>
              <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                3:45 PM
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="max-w-[80%] space-y-1">
              <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm dark:bg-gray-800">
                Hi! I'm looking to place an order for your new product. Can you
                please provide more details?
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                3:47 PM
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[80%] space-y-1">
              <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm dark:bg-gray-800">
                Sure, I'd be happy to help. What kind of product are you
                interested in?
              </div>
              <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                3:49 PM
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="max-w-[80%] space-y-1">
              <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm dark:bg-gray-800">
                I'm interested in your new line of eco-friendly office supplies.
                Can you tell me more about the pricing and availability?
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                3:51 PM
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t bg-gray-100 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <Input
            className="flex-1"
            placeholder="Type your message..."
            type="text"
          />
          <Button className="rounded-full" size="icon" variant="ghost">
            <PaperclipIcon className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
          <Button>Send</Button>
        </div>
      </div>
    </div>
  );
}

function PaperclipIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
