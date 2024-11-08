import { Thread } from "@/types/Thread";
import { Button } from "../ui/button";
import { Settings2Icon } from "lucide-react";
import { useThreadEditor } from "./thread/ThreadEditorProvider";
import { NavigationMenuOpenButton } from "../common/NavigationMenuOpenButton";
import HeaderBase from "../layout/HeaderBase";

type Props = {
  thread?: Thread;
};
export default function ChatScreenHeader({ thread }: Props) {
  const { openThreadEditor } = useThreadEditor();

  return (
    <HeaderBase>
      <div className="mx-auto flex items-center justify-between">
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
    </HeaderBase>
  );
}
