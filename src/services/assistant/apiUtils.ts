import { Message } from "@/types/Message";
import { AssistantAPIParam } from "@/types/api/Assistant";
import { getMessagesByThreadID } from "../messages";
import { v4 as uuidv4 } from "uuid";

export const getMessagesFromAssistantAPIParams = async (
  params: AssistantAPIParam
): Promise<Message[]> => {
  if (params.messages) {
    return params.messages;
  } else {
    if (params.content) {
      const messageLogs = await getMessagesByThreadID({
        threadID: params.threadID,
      });
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: params.content,
        thread_id: params.threadID,
      };

      return [...messageLogs, userMessage];
    } else {
      throw new Error(
        "Neither messages nor content are set. Please set either one."
      );
    }
  }
};
