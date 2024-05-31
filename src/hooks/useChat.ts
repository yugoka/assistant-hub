import { threadId } from "worker_threads";
import { Message, MessageChunk } from "@/types/Message";
import { AssistantAPIParam } from "@/types/api/Assistant";
import { generateUUIDForMessage, parseMessageContent } from "@/utils/message";
import { mergeResponseObjects } from "@/utils/mergeResponseObject";
import React from "react";
import { CreateThreadInput } from "@/services/threads";
import { Thread } from "@/types/Thread";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

interface UseChatProps {
  api: string;
  threadID: string | null | undefined;
}

export const useChat = ({ api, threadID: defaultThreadID }: UseChatProps) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState<string>("");
  const [threadID, setThreadID] = React.useState<string | null | undefined>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const router = useRouter();
  const { user } = useUser();

  // 読み込む
  React.useEffect(() => {
    (async () => {
      if (defaultThreadID) {
        if (threadID !== defaultThreadID) {
          try {
            setIsLoading(true);
            const messages = await getMessages(defaultThreadID);
            setMessages(messages);
          } finally {
            setIsLoading(false);
          }
        }
      } else {
        setMessages([]);
      }
      setThreadID(defaultThreadID);
    })();
  }, [defaultThreadID]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  // 送信時
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || !user) return;

    try {
      const targetThreadID = await ensureThreadID(input, user.id);
      const userMessage = createUserMessage(input, targetThreadID);

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");

      await sendMessageToAPI(newMessages, targetThreadID);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  // スレッドが無ければ作る
  const ensureThreadID = async (
    firstMessageContent: string,
    userID: string
  ): Promise<string> => {
    if (threadID) return threadID;

    const thread = await createThread(firstMessageContent, userID);
    setThreadID(thread.id);
    router.replace(`/chat?thread_id=${thread.id}`);
    return thread.id;
  };

  const createUserMessage = (content: string, threadID: string): Message => ({
    id: generateUUIDForMessage(),
    role: "user",
    content,
    thread_id: threadID,
  });

  const sendMessageToAPI = async (newMessages: Message[], threadID: string) => {
    try {
      const messagesStream = await getMessagesStream(
        { messages: newMessages, threadID, save: true },
        api
      );

      await processMessageStream(messagesStream, newMessages);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const processMessageStream = async (
    messagesStream: AsyncIterable<string>,
    newMessages: Message[]
  ) => {
    let buffer = "";
    let currentMessageID = "";

    for await (const chunk of messagesStream) {
      buffer += chunk;
      const lines = buffer.split("\n");

      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;
        try {
          const parsedChunk = JSON.parse(line) as MessageChunk;
          if (parsedChunk.id === currentMessageID) {
            newMessages[newMessages.length - 1] = mergeResponseObjects(
              newMessages[newMessages.length - 1],
              parsedChunk
            ) as Message;
          } else {
            currentMessageID = parsedChunk.id;
            newMessages.push(parsedChunk as Message);
          }

          setMessages([...newMessages]);
        } catch (error) {
          console.error("Error parsing JSON line:", error);
        }
      }
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
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

// メッセージを取得する
const getMessages = async (
  threadID: string,
  page?: number,
  pageSize?: number
): Promise<Message[]> => {
  const params = new URLSearchParams();
  params.append("thread_id", threadID);
  if (page !== undefined) {
    params.append("page", `${page}`);
  }
  if (pageSize !== undefined) {
    params.append("page_size", `${pageSize}`);
  }

  const url = `/api/messages?${params.toString()}`;

  try {
    // fetchリクエストを送信
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("fetched", data.length, "messages");
    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// メッセージからスレッドを作成するユーティリティ関数
const createThread = async (
  firstMessageContent: string,
  userID: string
): Promise<Thread> => {
  const userMessage = firstMessageContent || "New Thread";
  const truncatedMessage =
    userMessage.length > 30 ? `${userMessage.slice(0, 30)}...` : userMessage;

  const reqBody: CreateThreadInput = {
    name: truncatedMessage,
    user_id: userID,
  };

  const res = await fetch("/api/threads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody),
  });

  if (!res.ok) {
    throw new Error(`Failed to create thread: ${res.status}`);
  }

  return res.json();
};
