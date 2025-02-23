"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useWebRTCAudioSession from "@/hooks/useRealtimeChat";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThread } from "../chat/thread/ThreadProvider";

export default function VoiceAssistantScreen() {
  const { thread, threadId } = useThread();
  const [tools, setTools] = useState([]);

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
    // 音声会話の会話ログ（必要に応じて利用可能）
    // conversation: realtimeConversation,
  } = useWebRTCAudioSession(threadId || "", {
    voice: "shimmer",
    tools,
    model: "tts-1",
    initialSystemMessage:
      `${thread?.system_prompt}${thread?.memory}` ||
      "Start conversation with the user by saying 'Hello, how can I help you today?' Use the available tools when relevant. After executing a tool, you will need to respond (create a subsequent conversation item) to the user sharing the function result or error. If you do not respond with additional message with function result, user will not know you successfully executed the tool. Important: Speak and respond in the language of the user. Translate any texts to user's language if you need.",
  });

  const isSessionInProgress =
    realtimeStatus !== "stopped" && realtimeStatus !== "error";

  const toggleAudioSession = () => {
    handleStartStopClick();
  };

  return (
    <div className="flex h-full flex-col w-full">
      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col justify-center">
        <div>
          <div className="text-center">
            {isSessionActive ? (
              <p>音声通話中...</p>
            ) : (
              <p>音声通話を開始するには下のボタンをクリックしてください。</p>
            )}
          </div>
          <div className="flex-1 flex justify-center mt-5">
            <Button
              onClick={toggleAudioSession}
              disabled={isSessionInProgress && !isSessionActive}
              variant="outline"
              className="rounded-full w-11 h-11 p-0 flex items-center justify-center"
              type="button"
            >
              {isSessionActive ? (
                <MicOff size={22} className="text-red-500" />
              ) : isSessionInProgress ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Mic size={22} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
