import { Thread } from "@/types/Thread";
import { Button } from "../ui/button";
import { Settings2Icon } from "lucide-react";
import { useThreadEditor } from "./thread/ThreadEditorProvider";
import { NavigationMenuOpenButton } from "../common/NavigationMenuOpenButton";

type Props = {
  thread?: Thread;
};
export default function ChatScreenHeader({ thread }: Props) {
  const { openThreadEditor } = useThreadEditor();

  return (
    <div className="bg-white dark:bg-gray-950 px-4 py-2 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <NavigationMenuOpenButton className="block md:hidden" />
        <h1 className="text-lg font-medium truncate">
          {thread?.name || "New Chat"}
        </h1>
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
    </div>
  );
}
