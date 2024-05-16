import ThreadList from "./ThreadList";
import NewChatButton from "./NewChatButton";
import React from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatNavigation() {
  return (
    <>
      <NewChatButton />
      <React.Suspense
        fallback={
          <>
            <Skeleton className="w-[100px] h-[20px] rounded-full" />
          </>
        }
      >
        <Skeleton className="w-[100px] h-[20px]" />

        <ThreadList />
      </React.Suspense>
    </>
  );
}
