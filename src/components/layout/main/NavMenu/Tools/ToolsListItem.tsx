"use client";
import { createClient } from "@/utils/supabase/client";
import NavMenuListItem from "../NavMenuListItem";
import { Tool } from "@/types/Tool";
import { MouseEvent } from "react";

type Props = {
  tool: Tool;
  isSelected: boolean;
};

export default function ToolsListItem({ tool, isSelected }: Props) {
  const deleteTool = async (event: MouseEvent) => {
    event.preventDefault();
    const supabase = createClient();
    await supabase.from("Tools").delete().eq("id", tool.id);
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
