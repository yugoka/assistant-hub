"use client";

import { Player } from "@lottiefiles/react-lottie-player";
import { useEffect, useState } from "react";

type VoiceAssistantAnimationProps = {
  isChatActive: boolean;
  currentVolume: number;
};

export default function VoiceAssistantAnimation({
  isChatActive,
  currentVolume,
}: VoiceAssistantAnimationProps) {
  const [size, setSize] = useState(128);
  const speed = 1;

  useEffect(() => {
    const baseSize = 172;
    const chatMultiplier = isChatActive ? 1.2 : 1;
    const volumeMultiplier = 1 + currentVolume;
    const newSize = baseSize * chatMultiplier * volumeMultiplier;

    setSize(newSize);
  }, [isChatActive, currentVolume]);

  return (
    <span className="self-center">
      <Player
        autoplay
        loop
        src="/lottie/voice-assistant.json"
        className="inline-block transition-all duration-100 ease-in-out"
        style={{ width: size, height: size }}
        speed={speed}
      />
    </span>
  );
}
