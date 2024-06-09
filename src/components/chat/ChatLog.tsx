import { Message } from "@/types/Message";
import ChatLogBubble from "./ChatLogBubble";
import ChatLogToolCalls, { ToolCallResult } from "./ChatLogToolCalls";

type Props = {
  message: Message;
  username?: string;
  getToolCallResults: () => ToolCallResult[];
};

export default function ChatLog({
  message,
  username,
  getToolCallResults,
}: Props) {
  return (
    <>
      {message.content &&
        (message.role === "user" || message.role === "assistant") && (
          <ChatLogBubble message={message} username={username} />
        )}

      {message.role === "assistant" && message.tool_calls?.length && (
        <ChatLogToolCalls
          message={message}
          getToolCallResults={getToolCallResults}
        />
      )}
    </>
  );
}
