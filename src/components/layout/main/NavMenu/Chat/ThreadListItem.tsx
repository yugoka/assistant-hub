"use client";
import { Thread } from "@/types/Thread";
import { createClient } from "@/utils/supabase/client";
import React from "react";
import NavMenuListItem from "../NavMenuListItem";

type Props = {
  thread: Thread;
  isSelected: boolean;
};

export default function ThreadListItem({ thread, isSelected }: Props) {
  const deleteThread = async (event: React.MouseEvent) => {
    event.preventDefault();
    const supabase = createClient();
    await supabase.from("Threads").delete().eq("id", thread.id);
  };

  return (
    <>
      <NavMenuListItem
        href={`/chat?thread_id=${thread.id}`}
        onClickDeleteButton={deleteThread}
        isSelected={isSelected}
      >
        {thread.name}
      </NavMenuListItem>
    </>
  );
}
