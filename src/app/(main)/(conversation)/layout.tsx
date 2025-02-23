"use client";
import ThreadEditorProviderWrapper from "@/components/chat/thread/ThreadEditorProvider";
import ThreadProviderWrapper from "@/components/chat/thread/ThreadProvider";
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

export default function ConversationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const searchParams = useSearchParams();

  const threadId = searchParams.get("thread_id");
  return (
    <ThreadProviderWrapper threadId={threadId}>
      <ThreadEditorProviderWrapper>{children}</ThreadEditorProviderWrapper>
    </ThreadProviderWrapper>
  );
}
