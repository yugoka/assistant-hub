"use client";
import ChatScreen from "@/components/chat/ChatScreen";
import ThreadProviderWrapper from "@/components/chat/thread/ThreadProvider";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();

  const threadID = searchParams.get("thread_id");
  return (
    <ThreadProviderWrapper threadId={threadID}>
      <ChatScreen threadID={threadID} />
    </ThreadProviderWrapper>
  );
}
