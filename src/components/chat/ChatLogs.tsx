import { Message } from "@/types/Message";
import ChatLog from "./ChatLog";
import { ToolCallResult } from "./ChatLogToolCalls";

export type Props = {
  messages: Message[];
};

export default function ChatLogs({ messages }: Props) {
  return (
    <>
      {messages.map((message, index) => (
        <ChatLog
          message={message}
          key={message.id}
          getToolCallResults={() => getToolCallResults(index, messages)}
        />
      ))}
    </>
  );
}

// ToolCallの結果を問い合わせる
// 多少重い操作なので、アコーディオンが開かれた時のみ実行する
const getToolCallResults = (
  index: number,
  messages: Message[]
): ToolCallResult[] => {
  const targetMessage = messages[index];
  if (targetMessage.role !== "assistant" || !targetMessage.tool_calls?.length) {
    return [];
  }

  const targetToolCalls = targetMessage.tool_calls;
  const result: ToolCallResult[] = [];

  // 後のメッセージに結果を探しに行く
  for (let i = index + 1; i < messages.length; i++) {
    const toolCallResultMessage = messages[i];

    if (toolCallResultMessage.role === "tool") {
      const isMatched = targetToolCalls.some(
        (toolCall) => toolCall.id === toolCallResultMessage.tool_call_id
      );
      if (isMatched) {
        result.push({
          tool_call_id: toolCallResultMessage.tool_call_id,
          content: toolCallResultMessage.content,
        });
      }
    } else {
      // 基本想定されていないが、直下にtool以外が見つかったらやめる
      break;
    }
  }

  return result;
};
