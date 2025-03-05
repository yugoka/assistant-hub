"use client";

import VoiceAssistantScreen from "@/components/assistant/VoiceAssistantScreen";
import { useWakeword } from "@/hooks/useWakeword";

export default function VoiceChatPage() {
  const { status, isReady } = useWakeword();
  console.log(status, isReady);
  return <VoiceAssistantScreen />;
}
