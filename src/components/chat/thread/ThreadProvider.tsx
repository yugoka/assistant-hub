"use client";
import { Thread } from "@/types/Thread";
import { createContext, useContext, ReactNode, useState } from "react";
import { useQuery } from "react-query";

interface ThreadContextType {
  thread: Thread | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export default function ThreadProviderWrapper({
  children,
  threadId,
}: {
  children: ReactNode;
  threadId: string | null;
}) {
  const { data, isLoading, error } = useQuery<Thread | undefined, Error>(
    ["get-single-thread", threadId],
    async () => {
      if (!threadId) return undefined;
      const res = await fetch(`/api/threads/${threadId}`);
      const data = await res.json();
      if (data.error) {
        throw error;
      }
      return data as Thread;
    }
  );

  return (
    <ThreadContext.Provider
      value={{
        thread: data,
        error,
        isError: !!error,
        isLoading,
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
}

export const useThread = () => {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThread must be used within a ThreadProvider");
  }
  return context;
};
