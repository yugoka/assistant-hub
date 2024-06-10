import { TriangleAlertIcon } from "lucide-react";

export default function ErrorToast() {
  return (
    <div className="flex items-center gap-3 rounded-md bg-red-50 p-3 text-sm dark:bg-red-900/20">
      <TriangleAlertIcon className="h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400" />
      <div className="space-y-1">
        <p className="font-medium text-red-900 dark:text-red-400">Error</p>
        <p className="text-red-700 dark:text-red-300">
          Something went wrong. Please try again later.
        </p>
      </div>
    </div>
  );
}
