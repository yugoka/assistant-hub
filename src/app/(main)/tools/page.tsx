import { ToolIcon } from "@/components/common/icons/ToolIcon";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default async function ToolsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <span className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-400">
        <ToolIcon className="inline-block w-5 h-5 mb-1 mr-1" /> Select a tool or
        create a new one
      </span>
      <Link href="/tools/new">
        <Button className="flex items-center">
          <PlusIcon className="mr-2 h-4 w-4" />
          Create new tool
        </Button>
      </Link>
    </div>
  );
}
