"use client";
import ErrorLarge from "@/components/common/ErrorLarge";
import Loader from "@/components/common/Loader";
import ToolOverview from "@/components/tools/ToolOverview";
import ToolProviderWrapper from "@/contexts/ToolContext";
import { Tool } from "@/types/Tool";
import { createClient } from "@/utils/supabase/client";
import { ReactNode } from "react";
import { useQuery } from "react-query";

type Props = {
  params: {
    tool_id: string;
  };
  children: ReactNode;
};

export default function ToolsLayout({ params, children }: Props) {
  const toolID = params.tool_id;

  const { data, isLoading, error, refetch } = useQuery<Tool, Error>(
    ["get-single-tool", toolID],
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("Tools")
        .select()
        .eq("id", toolID)
        .single();

      if (error) {
        throw error;
      }

      return data as Tool;
    }
  );

  if (error) {
    return <ErrorLarge />;
  }

  if (isLoading || !data) {
    return <Loader />;
  }

  return (
    <ToolProviderWrapper value={{ tool: data, isLoading, error, refetch }}>
      {children}
    </ToolProviderWrapper>
  );
}
