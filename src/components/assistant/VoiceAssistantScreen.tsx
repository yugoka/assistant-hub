"use client";

import { useEffect, useState } from "react";
import useWebRTCAudioSession from "@/hooks/useRealtimeChat";
import { useThread } from "../chat/thread/ThreadProvider";
import VoiceAssitantAnimation from "./VoiceAssitantAnimation";
import { parseMessageContent } from "@/utils/message";

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
    conversation: realtimeConversation,
    currentVolume,
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
    <div className="flex h-full flex-col justify-center w-full">
      {/* メインコンテンツエリア */}
      {/* アニメーションコンポーネントにチャット状態と currentVolume を渡す */}
      <div>
        <div className="flex justify-center">
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
        <div className="text-center mt-2 h-10">
          <p>
            {parseMessageContent(
              realtimeConversation[realtimeConversation.length - 1]?.content
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
