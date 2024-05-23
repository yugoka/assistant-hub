import { Message, MessageChunk } from "@/types/Message";
import { AssistantAPIParam } from "@/types/api/Assistant";
import { generateUUIDForMessage } from "@/utils/message";
import { mergeResponseObjects } from "@/utils/mergeResponseObject";
import React from "react";

interface UseChatProps {
  api: string;
}

export const useChat = ({ api }: UseChatProps) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: generateUUIDForMessage(),
      role: "user",
      content: input,
    };

    const newMessages = [...messages, userMessage];

    // ユーザー送信のメッセージを追加
    setMessages(newMessages);
    // 入力フィールドをクリア
    setInput("");

    // APIにメッセージを送信
    try {
      const messagesStream = await getMessagesStream(
        { messages: newMessages },
        api
      );

      let buffer = "";
      let currentMessageID = "";

      for await (const chunk of messagesStream) {
        buffer += chunk;
        const lines = buffer.split("\n");

        // 最後の行はまだ完全なJSONでない可能性があるので、次のループに持ち越す
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;
          try {
            const parsedChunk = JSON.parse(line) as MessageChunk;
            if (parsedChunk.id === currentMessageID) {
              // メッセージIDがそのままなら、最後のメッセージにチャンクを統合する
              newMessages[newMessages.length - 1] = mergeResponseObjects(
                newMessages[newMessages.length - 1],
                parsedChunk
              ) as Message;
            } else {
              // メッセージIDが新出なら新しいメッセージを用意する
              currentMessageID = parsedChunk.id;
              newMessages.push(parsedChunk as Message);
            }

            setMessages([...newMessages]);
          } catch (error) {
            console.error("Error parsing JSON line:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
  };
};

const getMessagesStream = async (
  requestBody: AssistantAPIParam,
  api: string
) => {
  const response = await fetch(api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");

  if (!reader) {
    throw new Error(`Error: response.body is undefined`);
  }

  return {
    async *[Symbol.asyncIterator]() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield decoder.decode(value, { stream: true });
      }
    },
  };
};
