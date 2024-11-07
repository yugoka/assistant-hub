"use client";
import ThreadEditorDialog from "@/components/chat/thread/ThreadEditorDialog";
import { Thread } from "@/types/Thread";
import { createContext, useContext, ReactNode, useState } from "react";

interface ThreadEditorContextType {
  openThreadEditor: (thread: Thread) => void;
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

  const openThreadEditor = (thread: Thread) => {
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
