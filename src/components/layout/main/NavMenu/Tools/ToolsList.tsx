"use client";

import { createClient } from "@/utils/supabase/client";
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { useSearchParams } from "next/navigation";
import ToolsListItem from "./ToolsListItem";
import { Tool } from "@/types/Tool";

type Props = {
  query: {
    nameLike?: string;
  };
};

export default function ToolsList({ query }: Props) {
  const supabase = createClient();
  const [tools, setTools] = React.useState<Tool[]>([]);
  const searchParams = useSearchParams();
  const selectedToolID = searchParams.get("tool_id");

  const { user } = useUser();

  const fetchTools = async () => {
    let queryBuilder = supabase
      .from("Tools")
      .select()
      .eq("user_id", user?.id)
      .order("created_at");

    if (query.nameLike) {
      queryBuilder = queryBuilder.like("name", query.nameLike);
    }

    const result = await queryBuilder;
    const tools = result.data;

    setTools(tools || []);
  };

  const subscribeToolChanges = () => {
    // 変更を購読する
    supabase
      .channel("tools-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Tools",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log("payload:", payload);
          fetchTools();
        }
      )
      .subscribe();
  };

  React.useEffect(() => {
    fetchTools();
    subscribeToolChanges();
    return () => {
      supabase.channel("tool-list").unsubscribe();
    };
  }, [query]);

  return (
    <>
      {tools &&
        tools.map((tool) => (
          <ToolsListItem
            key={tool.id}
            tool={tool}
            isSelected={tool.id === selectedToolID}
          />
        ))}
    </>
  );
}
