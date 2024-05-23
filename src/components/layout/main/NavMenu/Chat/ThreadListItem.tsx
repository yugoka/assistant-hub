import { Button } from "@/components/ui/button";
import { Thread } from "@/types/Thread";
import { createClient } from "@/utils/supabase/client";
import { TrashIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  thread: Thread;
};

export default function ThreadListItem({ thread }: Props) {
  const deleteThread = async () => {
    const supabase = createClient();
    await supabase.from("Threads").delete().eq("id", thread.id);
  };

  return (
    <>
      <Link
        className="flex w-full items-center justify-between rounded-md px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
        href={`/chat?thread_id=${thread.id}`}
      >
        <span className="flex my-1 flex-grow flex-shrink items-center truncate">
          {thread.name || "New Thread"}
        </span>

        <Button
          variant="link"
          className="flex my-0 flex-grow-0 flex-shrink-0 rounded-full w-6 h-6 p-0 ml-2 hover:bg-gray-100"
          onClick={deleteThread}
        >
          <TrashIcon className="w-4" />
        </Button>
      </Link>
    </>
  );
}