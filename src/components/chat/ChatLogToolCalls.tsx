import { Message } from "@/types/Message";
import { useState } from "react";
import { ToolIcon } from "../common/icons/ToolIcon";
import {
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
  Accordion,
} from "@/components/ui/accordion";

export type ToolCallResult = {
  tool_call_id: string;
  content: string;
};

type Props = {
  message: Message;
  username?: string;
  getToolCallResults: () => ToolCallResult[];
};

export default function ChatLogToolCalls({
  message,
  getToolCallResults,
}: Props) {
  const [toolCallResults, setToolCallResults] = useState<ToolCallResult[]>([]);

  // アコーディオンを開いた時に結果を更新する
  const handleTrigger = (value: string) => {
    if (value) {
      setToolCallResults(getToolCallResults());
    }
  };

  return (
    <>
      {message.role === "assistant" && message.tool_calls && (
        <>
          <Accordion
            className="flex"
            collapsible
            type="single"
            onValueChange={handleTrigger}
          >
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="flex justify-start">
                <p className="mr-2 flex items-center text-xs font-mono text-gray-500 dark:text-gray-400">
                  <ToolIcon className="inline-block w-4 mr-2" />
                  {message.tool_calls
                    .map((toolCall) => toolCall.function.name)
                    .join(", ")}{" "}
                </p>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  <div>
                    arguments:
                    <div className="mt-1 whitespace-pre-wrap">
                      {message.tool_calls.map((toolCall) => (
                        <p
                          key={toolCall.id}
                          className="flex my-1"
                        >{`${toolCall.function.arguments}`}</p>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    result:
                    <div className="mt-1 whitespace-pre-wrap">
                      {toolCallResults.map((toolCallResult) => (
                        <p
                          key={toolCallResult.tool_call_id}
                          className="flex my-1"
                        >
                          {toolCallResult.content}
                        </p>
                      ))}
                    </div>
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
