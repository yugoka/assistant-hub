import { Message } from "@/types/Message";
import React from "react";
import ChatLogBubble from "./ChatLogBubble";
import { ToolIcon } from "../common/icons/ToolIcon";
import {
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
  Accordion,
} from "@/components/ui/accordion";
import ChatLogToolCalls from "./ChatLogToolCalls";

type Props = {
  message: Message;
  username?: string;
};

export default function ChatLog({ message, username }: Props) {
  return (
    <>
      {message.content && (
        <ChatLogBubble message={message} username={username} />
      )}
      <ChatLogToolCalls message={message} />
    </>
  );
}
