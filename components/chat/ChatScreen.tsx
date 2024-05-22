"use client";
import ChatBubble from "@/components/chat/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "ai/react";
import React from "react";

export default function ChatScreen() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/web-chat/",
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
        <div className="grid gap-4 max-w-2xl mx-auto">
          {messages.map((message) => (
            <ChatBubble
              role={message.role}
              key={message.id}
              content={message.content}
            />
          ))}
        </div>
        <div ref={endOfMessages} className="h-1" />
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
