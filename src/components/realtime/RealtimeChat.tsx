"use client";

import React, { useEffect, useState } from "react";
import useWebRTCAudioSession from "@/hooks/useRealtimeChat";
import type { OpenAIToolWithoutExecutor } from "@/services/schema/openapiToTools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Send } from "lucide-react";

export default function RealtimeChat() {
  const [tools, setTools] = useState<OpenAIToolWithoutExecutor[]>([]);
  const [inputText, setInputText] = useState("");

  const {
    status,
    isSessionActive,
    audioIndicatorRef,
    handleStartStopClick,
    conversation,
    sendTextMessage,
    currentVolume,
  } = useWebRTCAudioSession({
    voice: "alloy",
    tools,
    initialSystemMessage: "あなたは有能なアシスタントです。",
  });

  useEffect(() => {
    async function fetchTools() {
      try {
        const res = await fetch("/api/external-tools");
        const data = await res.json();
        setTools(data);
      } catch (error) {
        console.error("Failed to fetch tools:", error);
      }
    }
    fetchTools();
  }, []);

  const handleSendText = () => {
    if (!inputText.trim()) return;
    sendTextMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">Controls</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Status</h3>
            <div className="text-sm">{status}</div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Volume</h3>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${currentVolume * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Mic Indicator</h3>
            <div
              ref={audioIndicatorRef}
              className="w-full h-8 bg-gray-200 rounded-md overflow-hidden"
            >
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: "0%" }}
              ></div>
            </div>
          </div>
          <Button
            onClick={handleStartStopClick}
            className="w-full"
            variant={isSessionActive ? "destructive" : "default"}
          >
            <Mic className="mr-2 h-4 w-4" />
            {isSessionActive ? "Stop Session" : "Start Session"}
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Realtime Chat Demo</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    <p>{msg.text}</p>
                    {!msg.isFinal && (
                      <span className="text-xs italic">
                        {msg.role === "user" ? "(sending...)" : "(typing...)"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 flex space-x-2">
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            onKeyPress={(e) => e.key === "Enter" && handleSendText()}
          />
          <Button onClick={handleSendText}>
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>
      </main>
    </div>
  );
}
