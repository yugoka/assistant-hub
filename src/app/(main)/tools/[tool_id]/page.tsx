"use client";
import Loader from "@/components/common/Loader";
import ToolOverview from "@/components/tools/ToolOverview";
import { useTool } from "@/contexts/ToolContext";

export default function ToolsOverviewPage() {
  const { tool } = useTool();

  if (!tool) {
    return <Loader />;
  }

  return <ToolOverview tool={tool} />;
}
