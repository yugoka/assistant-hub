"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatLogs from "./ChatLogs";
import Loader from "../common/Loader";
import ErrorLarge from "../common/ErrorLarge";
import NewChatMessage from "./NewChatMessage";
import ChatScreenHeader from "./ChatScreenHeader";
import { createClient } from "@/utils/supabase/client";
import { Message } from "@/types/Message";
import { useChat } from "@/hooks/useChat";
import { useThread } from "./thread/ThreadProvider";
import useWebRTCAudioSession from "@/hooks/useRealtimeChat";
import type { OpenAIToolWithoutExecutor } from "@/services/schema/openapiToTools";
import { ArrowUpIcon, Loader2, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [tools, setTools] = useState<OpenAIToolWithoutExecutor[]>([]);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  const {
    status: realtimeStatus,
    isSessionActive,
    handleStartStopClick,
    currentVolume,
    conversation: realtimeConversation,
    sendTextMessage: sendRealtimeTextMessage,
  } = useWebRTCAudioSession(threadID || "", {
    voice: "alloy",
    tools,
    initialSystemMessage: "あなたは有能なアシスタントです。",
  });

  const isSessionInProgress =
    realtimeStatus !== "stopped" && realtimeStatus !== "error";

  useEffect(() => {
    async function fetchTools() {
      try {
        const res = await fetch("/api/tools/search", {
          method: "POST",
          body: JSON.stringify({
            query: "test",
            minTools: 5,
            maxTools: 5,
            openai_tools_mode: true,
          }),
        });
        const data = await res.json();
        setTools(data);
      } catch (error) {
        console.error("Failed to fetch tools:", error);
      }
    }
    fetchTools();
  }, []);

  const handleNewMessage = (newMessage: Message) => {
    setMessages((prevMessages) => {
      const idx = prevMessages.findIndex((m) => m.id === newMessage.id);
      if (idx === -1) {
        return [...prevMessages, newMessage];
      } else {
        const updated = [...prevMessages];
        updated[idx] = newMessage;
        return updated;
      }
    });
  };

  useEffect(() => {
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadID, handleNewMessage]); // Added handleNewMessage to dependencies

  useEffect(() => {
    realtimeConversation.forEach((msg) => {
      handleNewMessage(msg);
    });
  }, [realtimeConversation, handleNewMessage]); // Added handleNewMessage to dependencies

  const scrollToBottom = (instant = false) => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollTo({
        top: scrollContainer.current.scrollHeight,
        behavior: instant ? "instant" : "smooth",
      });
    }
  };

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

  const handleScroll = () => {
    if (scrollContainer.current) {
      const { scrollTop, clientHeight, scrollHeight } = scrollContainer.current;
      const isUserAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setIsAtBottom(isUserAtBottom);
    }
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (isSessionActive) {
      sendRealtimeTextMessage(input.trim());
      handleInputChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    } else {
      handleSubmit(e);
    }
  };

  const toggleAudioSession = () => {
    handleStartStopClick();
    setIsHeaderExpanded(!isHeaderExpanded);
  };

  return (
    <div className="flex h-full flex-col w-full">
      <ChatScreenHeader
        thread={thread}
        realtimeStatus={realtimeStatus}
        isSessionInProgress={isSessionInProgress}
        isSessionActive={isSessionActive}
        currentVolume={currentVolume}
      />

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

      {/* Footer */}
      <div className="border-t bg-gray-100 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <form
          className="flex items-center gap-2 max-w-3xl mx-auto"
          onSubmit={onFormSubmit}
        >
          {/* 音声通話開始ボタン */}
          <Button
            onClick={toggleAudioSession}
            disabled={isSessionInProgress && !isSessionActive}
            variant="outline"
            className="rounded-full w-11 h-11 p-0 flex items-center justify-center"
            type="button"
          >
            <AnimatePresence mode="wait">
              {isSessionActive ? (
                <motion.div
                  key="micOff"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.1 }}
                >
                  <MicOff size={22} className="text-red-500" />
                </motion.div>
              ) : isSessionInProgress ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.1 }}
                >
                  <Loader2 size={22} className="animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="mic"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.1 }}
                >
                  <Mic size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* テキスト入力 */}
          <Input
            className="flex-1 h-12 rounded-full"
            placeholder="Type your message..."
            type="text"
            value={input}
            onChange={handleInputChange}
          />

          {/* 送信ボタン */}
          <Button
            type="submit"
            disabled={isLoading || isStreaming}
            className="flex items-center justify-center rounded-full p-0 w-10 h-10"
          >
            <ArrowUpIcon size={20} />
          </Button>
        </form>
      </div>

      <Button
        variant="outline"
        className={`opacity-100 disabled:opacity-0 w-10 h-10 fixed bottom-24 right-4 rounded-full transition-opacity duration-300 delay-100`}
        onClick={() => scrollToBottom()}
        disabled={isAtBottom}
      >
        ↓
      </Button>
    </div>
  );
}
