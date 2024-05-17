import { Thread } from "@/types/Thread";
import { MessageCircle, MessageSquareIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  thread: Thread;
};

export default function ThreadListItem({ thread }: Props) {
  return (
    <>
      <Link
        className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
        href={`/chat?thread_id=${thread.id}`}
      >
        <MessageSquareIcon className="w-5 me-2" />
        {thread.name || "New Thread"}
      </Link>
    </>
  );
}
