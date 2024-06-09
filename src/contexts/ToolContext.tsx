"use client";
import { createContext, useContext, ReactNode } from "react";
import { Tool } from "@/types/Tool";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "react-query";

type ToolContextType = {
  tool: Tool | null;
  isLoading: boolean;
  error: Error | null;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Tool, Error>>;
};

const ToolContext = createContext<ToolContextType | undefined>(undefined);

export const useTool = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error("useTool must be used within a ToolProvider");
  }
  return context;
};

type ToolProviderProps = {
  children: ReactNode;
  value: ToolContextType;
};

export default function ToolProviderWrapper({
  children,
  value,
}: ToolProviderProps) {
  return <ToolContext.Provider value={value}>{children}</ToolContext.Provider>;
}
