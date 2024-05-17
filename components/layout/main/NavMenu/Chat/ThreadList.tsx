"use client";

import { createClient } from "@/utils/supabase/client";
import ThreadListItem from "./ThreadListItem";
import React from "react";
import { Thread } from "@/types/Thread";

type Props = {
  query: {
    nameLike?: string;
  };
};

export default function ThreadList({ query }: Props) {
  const supabase = createClient();
  const [threads, setThreads] = React.useState<Thread[]>([]);

  const fetchThreads = async () => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let queryBuilder = supabase
        .from("Threads")
        .select()
        .eq("user_id", user?.id);

      if (query.nameLike) {
        queryBuilder = queryBuilder.like("name", query.nameLike);
      }

      const result = await queryBuilder;
      const threads = result.data;

      setThreads(threads || []);
    })();
  };

  React.useEffect(() => {
    fetchThreads();
  }, [query]);

  return (
    <>
      {threads &&
        threads.map((thread) => (
          <ThreadListItem key={thread.id} thread={thread} />
        ))}
    </>
  );
}
