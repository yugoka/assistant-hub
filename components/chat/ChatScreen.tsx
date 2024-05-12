"use client";
import ChatBubble from "@/components/chat/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "ai/react";

export default function ChatScreen() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/assistant",
  });

  return (
    <div className="flex h-full max-h-screen flex-col w-full">
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 max-w-2xl mx-auto">
          {messages.map((message) => (
            <ChatBubble
              role={message.role}
              key={message.id}
              content={message.content}
            />
          ))}
        </div>
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
