import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { useEffect, useRef, useState } from "react";
import ChatLogs from "./ChatLogs";
import Loader from "../common/Loader";
import { createClient } from "@/utils/supabase/client";
import { Message } from "@/types/Message";
import ErrorLarge from "../common/ErrorLarge";
import NewChatMessage from "./NewChatMessage";
import { useThread } from "./thread/ThreadProvider";
import ChatScreenHeader from "./ChatScreenHeader";

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
    isError,
    isStreaming,
  } = useChat({
    api: "/api/chat/",
    threadID,
  });

  const { thread } = useThread();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollContainer = useRef<HTMLDivElement>(null);

  const handleNewMessage = (newMessage: Message) => {
    setMessages((messages) => {
      const newMessageIndex = messages.findIndex(
        (message) => message.id === newMessage.id
      );
      const newMessagesList = [...messages];

      if (newMessageIndex === -1) {
        newMessagesList.push(newMessage);
      } else {
        newMessagesList[newMessageIndex] = newMessage;
      }
      return newMessagesList;
    });
  };

  const subscribeMessageChanges = () => {
    supabase
      .channel(`chat-messages-${threadID || "new"}`)
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
      supabase.channel(`chat-messages-${threadID || "new"}`).unsubscribe();
    };
  }, [threadID]);

  useEffect(() => {
    if (isAtBottom || scrollContainer.current?.scrollTop === 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom(true);
    }
  }, [isLoading]);

  const scrollToBottom = (instant = false) => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollTo({
        top: scrollContainer.current.scrollHeight,
        behavior: instant ? "instant" : "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainer.current) {
      const { scrollTop, clientHeight, scrollHeight } = scrollContainer.current;
      const isUserAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setIsAtBottom(isUserAtBottom);
    }
  };

  return (
    <div className="flex h-full flex-col w-full">
      <ChatScreenHeader thread={thread} />
      <div
        className="flex-1 overflow-y-auto py-4 px-4 md:px-6"
        ref={scrollContainer}
        onScroll={handleScroll}
      >
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <ErrorLarge />
        ) : messages.length ? (
          <div className="max-w-3xl mx-auto">
            <ChatLogs messages={messages} />
          </div>
        ) : (
          <NewChatMessage />
        )}
      </div>

      {/* 既存のスクロールボタンとフォーム */}
      <Button
        variant="outline"
        className={`opacity-100 disabled:opacity-0 w-10 h-10 fixed bottom-24 right-4 rounded-full transition-opacity duration-300 delay-100`}
        onClick={() => scrollToBottom()}
        disabled={isAtBottom}
      >
        ↓
      </Button>

      <div className="border-t bg-gray-100 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <form
          className="flex items-center gap-2 max-w-3xl mx-auto"
          onSubmit={handleSubmit}
        >
          <Input
            className="flex-1 h-12"
            placeholder="Type your message..."
            type="text"
            value={input}
            onChange={handleInputChange}
          />
          <Button type="submit" disabled={isLoading || isStreaming}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
