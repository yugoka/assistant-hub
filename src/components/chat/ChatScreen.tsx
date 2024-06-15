"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { useEffect, useRef } from "react";
import ChatLogs from "./ChatLogs";
import Loader from "../common/Loader";
import { createClient } from "@/utils/supabase/client";
import { Message } from "@/types/Message";

type Props = {
  threadID: string | null | undefined;
};

export default function ChatScreen({ threadID }: Props) {
  const supabase = createClient();

  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: "/api/chat/",
    threadID,
  });

  const handleNewMessage = (newMessage: Message) => {
    setMessages((messages) => {
      const newMessageIndex = messages.findLastIndex(
        (message) => message.id === newMessage.id
      );
      const newMessagesList = [...messages];

      if (newMessageIndex === -1) {
        newMessagesList.push(newMessage);
        return newMessagesList;
      } else {
        newMessagesList[newMessageIndex] = newMessage;
        return newMessagesList;
      }
    });
  };

  const subscribeMessageChanges = () => {
    // 変更を購読する
    supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadID}`,
        },
        (payload) => {
          handleNewMessage(payload.new as Message);
        }
      )
      .subscribe();
  };

  useEffect(() => {
    subscribeMessageChanges();
    return () => {
      supabase.channel("chat-messages").unsubscribe();
    };
  }, [threadID]);

  const endOfMessages = useRef<HTMLDivElement>(null);
  const scrollContainer = useRef(null);

  // 自動スクロール
  useEffect(() => {
    followBottom(100);
  }, [messages]);

  // 読み込み時に一度だけ最下部にスクロール
  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

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
          <Loader />
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
