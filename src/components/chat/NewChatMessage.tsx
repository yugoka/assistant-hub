import { MessageSquareIcon } from "lucide-react";

export default function NewChatMessage() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <MessageSquareIcon className="w-16 h-16 mb-2" />
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        New Chat
      </h2>
    </div>
  );
}
