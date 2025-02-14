import { Thread } from "@/types/Thread";
import { Button } from "../ui/button";
import { Settings2Icon, Mic, Volume2 } from "lucide-react";
import { useThreadEditor } from "./thread/ThreadEditorProvider";
import { NavigationMenuOpenButton } from "../common/NavigationMenuOpenButton";
import HeaderBase from "../layout/HeaderBase";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  thread?: Thread;
  realtimeStatus?: string;
  isSessionInProgress?: boolean;
  isSessionActive?: boolean;
  currentVolume?: number;
};

export default function ChatScreenHeader({
  thread,
  realtimeStatus,
  isSessionInProgress,
  isSessionActive,
  currentVolume,
}: Props) {
  const { openThreadEditor } = useThreadEditor();

  return (
    <HeaderBase>
      <div className="mx-auto flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <NavigationMenuOpenButton className="block md:hidden" />
          <h1 className="text-lg font-medium truncate">
            {thread?.name || "New Chat"}
          </h1>
          <AnimatePresence>
            {isSessionInProgress && (
              <motion.span
                className={`text-sm transition-colors ${
                  isSessionActive
                    ? "text-green-500 animate-pulse"
                    : "text-yellow-400"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                ●
              </motion.span>
            )}

            {isSessionInProgress && (
              <div>
                <div className="flex items-center space-x-2">
                  <Volume2 size={16} />
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentVolume || 0) * 100}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => openThreadEditor(thread)}
          disabled={!thread}
        >
          <Settings2Icon className="h-5 w-5" />
          <span className="sr-only">Thread Settings</span>
        </Button>
      </div>
    </HeaderBase>
  );
}
