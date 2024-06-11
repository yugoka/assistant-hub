"use client";
import NavMenuListItem from "../NavMenuListItem";
import { Tool } from "@/types/Tool";
import { useRouter } from "next/navigation";
import { MouseEvent, useEffect } from "react";

type Props = {
  tool: Tool;
  isSelected: boolean;
};

export default function ToolsListItem({ tool, isSelected }: Props) {
  const router = useRouter();

  const deleteTool = async (event: MouseEvent) => {
    event.preventDefault();
    const currentPath = window.location.pathname.split("?")[0];
    console.log(currentPath);
    if (currentPath === `/tools/${tool.id}`) {
      router.replace("/tools");
    }

    await fetch(`/api/tools/${tool.id}`, {
      method: "DELETE",
    });
  };

  return (
    <>
      <NavMenuListItem
        href={`/tools/${tool.id}`}
        onClickDeleteButton={deleteTool}
        isSelected={isSelected}
      >
        {tool.name}
      </NavMenuListItem>
    </>
  );
}
