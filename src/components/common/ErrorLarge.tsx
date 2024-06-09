import { TriangleAlertIcon } from "lucide-react";

export default function ErrorLarge() {
  return (
    <div className="h-full flex flex-col justify-center items-center space-y-4">
      <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/50">
        <TriangleAlertIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
      </div>
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-bold">Error</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Something went wrong. Please try again later.
        </p>
      </div>
    </div>
  );
}
