"use client";
import { Thread } from "@/types/Thread";
import NavMenuListItem from "../NavMenuListItem";
import { MouseEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  thread: Thread;
  isSelected: boolean;
};

export default function ThreadListItem({ thread, isSelected }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const deleteThread = async (event: MouseEvent) => {
    event.preventDefault();
    if (searchParams.get("thread_id") === thread.id) {
      router.replace("/chat");
    }
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
        renderDeleteButton={!thread.starred}
      >
        {thread.name}
      </NavMenuListItem>
    </>
  );
}
