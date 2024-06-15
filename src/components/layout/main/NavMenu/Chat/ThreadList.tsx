"use client";

import ThreadListItem from "./ThreadListItem";
import { Thread } from "@/types/Thread";
import { useUser } from "@/contexts/UserContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "react-query";
import ErrorToast from "@/components/common/ErrorToast";

type Props = {
  query: {
    nameLike?: string;
  };
};

export default function ThreadList({ query }: Props) {
  const searchParams = useSearchParams();
  const selectedThreadID = searchParams.get("thread_id");
  const supabase = createClient();
  const { user } = useUser();

  const {
    data: threads,
    error,
    refetch,
  } = useQuery<Thread[], Error>(["get-thread-list", user?.id], async () => {
    const res = await fetch(`/api/threads?user_id=${user?.id || ""}`);
    const data = await res.json();
    return data as Thread[];
  });

  useEffect(() => {
    supabase
      .channel("thread-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "threads",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          refetch();
        }
      )
      .subscribe();
    return () => {
      supabase.channel("thread-list").unsubscribe();
    };
  }, []);

  if (error) {
    <ErrorToast />;
  }

  if (!threads) {
    return (
      <div className="pt-5 text-gray-400 dark:text-gray-600 text-center text-xs">
        Fetching Threads...
      </div>
    );
  }

  return (
    <>
      {threads &&
        threads.map((thread) => (
          <ThreadListItem
            key={thread.id}
            thread={thread}
            isSelected={thread.id === selectedThreadID}
          />
        ))}
    </>
  );
}
