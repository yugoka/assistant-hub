"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import React from "react";
import ChatLogs from "./ChatLogs";

type Props = {
  threadID: string | null | undefined;
};

export default function ChatScreen({ threadID }: Props) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat/",
      threadID,
    });

  const endOfMessages = React.useRef<HTMLDivElement>(null);
  const scrollContainer = React.useRef(null);

  // 自動スクロール
  React.useEffect(() => {
    followBottom(80);
  }, [messages]);

  const scrollToBottom = () => {
    if (endOfMessages.current) {
      endOfMessages.current.scrollIntoView({ behavior: "auto" });
    }
  };

  const followBottom = (offset: number) => {
    if (scrollContainer.current && endOfMessages.current) {
      const { scrollTop, clientHeight, scrollHeight } = scrollContainer.current;

      // ここの高さはハードコーディングなので注意
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - offset;

      if (isAtBottom) {
        scrollToBottom();
      }
    }
  };

  return (
    <div className="flex h-full flex-col w-full">
      <div className="flex-1 overflow-auto p-4" ref={scrollContainer}>
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-400 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 max-w-2xl mx-auto">
              <ChatLogs messages={messages} />
            </div>
            <div ref={endOfMessages} className="h-1" />
          </>
        )}
      </div>

      <div className="border-t bg-gray-100 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <form
          className="flex items-center gap-2 max-w-2xl mx-auto"
          onSubmit={handleSubmit}
        >
          <Input
            className="flex-1 h-12"
            placeholder="Type your message..."
            type="text"
            value={input}
            onChange={handleInputChange}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}
