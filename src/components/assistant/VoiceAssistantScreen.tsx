"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useWebRTCAudioSession from "@/hooks/useRealtimeChat";
import { useThread } from "../chat/thread/ThreadProvider";
import VoiceAssitantAnimation from "./VoiceAssitantAnimation";
import { parseMessageContent } from "@/utils/message";
import { fillDateInSystemPrompt } from "@/prompts/systemPrompt";

export default function VoiceAssistantScreen() {
  const { thread, threadId } = useThread();
  const [tools, setTools] = useState([]);
  const [displayedText, setDisplayedText] = useState("");

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

  const {
    status: realtimeStatus,
    isSessionActive,
    handleStartStopClick,
    conversation: realtimeConversation,
    currentVolume,
  } = useWebRTCAudioSession(threadId || "", {
    voice: "shimmer",
    tools,
    turn_detection: {
      threshold: 0.7,
    },
    model: "tts-1",
    initialSystemMessage:
      `${fillDateInSystemPrompt(thread?.system_prompt || "")}${
        thread?.memory
      }` ||
      "Start conversation with the user by saying 'Hello, how can I help you today?' Use the available tools when relevant. After executing a tool, you will need to respond (create a subsequent conversation item) to the user sharing the function result or error. If you do not respond with additional message with function result, user will not know you successfully executed the tool. Important: Speak and respond in the language of the user. Translate any texts to user's language if you need.",
  });

  const isSessionInProgress =
    realtimeStatus !== "stopped" && realtimeStatus !== "error";

  const toggleAudioSession = () => {
    handleStartStopClick();
  };

  const latestMessage = realtimeConversation[realtimeConversation.length - 1];

  useEffect(() => {
    if (latestMessage) {
      setDisplayedText(parseMessageContent(latestMessage.content) || "");
    }
  }, [latestMessage]);

  return (
    <div className="flex h-full flex-col justify-center w-full">
      <div>
        <div className="flex justify-center mt-48">
          <button
            className="flex flex-col justify-center w-28 h-28 rounded-full"
            onClick={toggleAudioSession}
            disabled={isSessionInProgress && !isSessionActive}
          >
            <VoiceAssitantAnimation
              isChatActive={isSessionInProgress}
              currentVolume={currentVolume}
            />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center min-h-64">
          <AnimatePresence mode="wait">
            {latestMessage && (
              <motion.div
                key={latestMessage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
              >
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 shadow-sm min-h-16">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {displayedText}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
