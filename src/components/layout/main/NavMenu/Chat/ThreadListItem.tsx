"use client";
import { Thread } from "@/types/Thread";
import NavMenuListItem from "../NavMenuListItem";
import { MouseEvent } from "react";

type Props = {
  thread: Thread;
  isSelected: boolean;
};

export default function ThreadListItem({ thread, isSelected }: Props) {
  const deleteThread = async (event: MouseEvent) => {
    event.preventDefault();
    await fetch(`/api/threads/${thread.id}`, {
      method: "DELETE",
    });
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
