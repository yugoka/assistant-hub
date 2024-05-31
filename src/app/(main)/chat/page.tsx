"use client";
import ChatScreen from "@/components/chat/ChatScreen";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();

  const threadID = searchParams.get("thread_id");
  return <ChatScreen threadID={threadID} />;
}
