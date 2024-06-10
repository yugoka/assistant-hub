"use client";
import ErrorLarge from "@/components/common/ErrorLarge";
import Loader from "@/components/common/Loader";
import ToolProviderWrapper from "@/contexts/ToolContext";
import { Tool } from "@/types/Tool";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery<Tool, Error>(
    ["get-single-tool", toolID],
    async () => {
      const res = await fetch(`/api/tools/${toolID}`);
      const data = await res.json();
      if (data.error) {
        router.replace("/tools");
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
