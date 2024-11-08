"use client";
import ChatScreen from "@/components/chat/ChatScreen";
import ThreadEditorProviderWrapper from "@/components/chat/thread/ThreadEditorProvider";
import ThreadProviderWrapper from "@/components/chat/thread/ThreadProvider";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();

  const threadID = searchParams.get("thread_id");
  return (
    <ThreadProviderWrapper threadId={threadID}>
      <ThreadEditorProviderWrapper>
        <ChatScreen threadID={threadID} />
      </ThreadEditorProviderWrapper>
    </ThreadProviderWrapper>
  );
}
