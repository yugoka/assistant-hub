"use client";
import ThreadEditorDialog from "@/components/chat/thread/ThreadEditorDialog";
import { Thread } from "@/types/Thread";
import { createContext, useContext, ReactNode, useState, useMemo } from "react";
import { useThread } from "./ThreadProvider";

interface ThreadEditorContextType {
  openThreadEditor: (thread?: Thread) => void;
}

const ThreadEditorContext = createContext<ThreadEditorContextType | undefined>(
  undefined
);

export default function ThreadEditorProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const [isThreadEditorMenuOpen, setIsThreadEditorMenuOpen] =
    useState<boolean>(false);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const { refetch } = useThread();

  const openThreadEditor = (thread?: Thread) => {
    if (!thread) {
      return;
    }
    setIsThreadEditorMenuOpen(true);
    setCurrentThread(thread);
  };

  return (
    <ThreadEditorContext.Provider
      value={{
        openThreadEditor,
      }}
    >
      <ThreadEditorDialog
        isOpen={isThreadEditorMenuOpen}
        setIsOpen={setIsThreadEditorMenuOpen}
        defaultThread={currentThread}
        refetch={refetch}
      />
      {children}
    </ThreadEditorContext.Provider>
  );
}

export const useThreadEditor = () => {
  const context = useContext(ThreadEditorContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
