import { Message } from "@/types/Message";
import React from "react";
import { ToolIcon } from "../common/icons/ToolIcon";
import {
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
  Accordion,
} from "@/components/ui/accordion";

type Props = {
  message: Message;
  username?: string;
};

export default function ChatLogToolCalls({ message }: Props) {
  return (
    <>
      {message.role === "assistant" && message.tool_calls && (
        <>
          <Accordion className="flex" collapsible type="single">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="flex justify-start">
                <p className="mr-2 flex items-center text-xs font-mono text-gray-500 dark:text-gray-400">
                  <ToolIcon className="inline-block w-4 mr-2" />
                  {message.tool_calls
                    .map((toolCall) => toolCall.function.name)
                    .join(", ")}
                  を呼び出しています...
                </p>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  arguments
                  <div className="mt-1 whitespace-pre-wrap">
                    {message.tool_calls.map((toolCall) => (
                      <p
                        key={toolCall.id}
                        className="flex my-1"
                      >{`${toolCall.function.arguments}`}</p>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </>
  );
}
