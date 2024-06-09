import { EditIcon, KeyRoundIcon, XIcon } from "lucide-react";
import { ToolIcon } from "../common/icons/ToolIcon";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Tool } from "@/types/Tool";
import React from "react";
import Link from "next/link";

type Props = {
  tool: Tool;
};

export default function ToolOverview({ tool }: Props) {
  const [isCredentialVisible, setIsCredentialVisible] =
    React.useState<boolean>(false);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto px-4 py-8 md:px-6">
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ToolIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            <h1 className="text-2xl font-bold">{tool.name}</h1>
          </div>
          <Link href={`/tools/${tool.id}/edit`}>
            <Button variant="outline">
              <EditIcon className="w-4 mr-1" />
              Edit
            </Button>
          </Link>
        </div>
        <div>
          <h2 className="text-md font-bold mb-2">Description</h2>
          <pre className="w-full whitespace-pre-wrap text-sm text-gray-500 dark:text-gray-400">
            {tool.description}
          </pre>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-2">Schema</h2>
        <Card className="bg-gray-100 dark:bg-gray-800 p-4 max-h-72 overflow-scroll">
          <CardContent className="py-1 px-2">
            <pre className="text-sm font-mono text-gray-500 dark:text-gray-400">
              {JSON.stringify(JSON.parse(tool.schema), null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="gap-20 grid md:grid-cols-2">
        <div className="grid gap-4">
          <div>
            <h2 className="text-lg font-bold">Execution Metrics</h2>
            <div className="mt-2 grid gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Total Executions</span>
                <span className="font-medium">{tool.execution_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Success Count</span>
                <span className="font-medium">{tool.success_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Success Rate</span>
                <span className="font-medium">
                  {tool.execution_count
                    ? `${(
                        (tool.success_count / tool.execution_count) *
                        100
                      ).toFixed(0)}`
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average Execution Time</span>
                <span className="font-medium">
                  {tool.average_execution_time || 0}ms
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <h2 className="text-lg font-bold">Credentials</h2>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-medium">Type:</span>
              {tool.auth_type}
            </div>

            {tool.auth_type !== "None" && (
              <div className="flex items-center gap-2 mt-2">
                <span className="font-medium">Secret:</span>
                {isCredentialVisible ? (
                  <>
                    <code className="bg-gray-100 px-2 py-1 rounded-md dark:bg-gray-800">
                      {tool.credential}
                    </code>
                    <Button
                      variant="outline"
                      className="p-0 w-6 h-6 rounded-full"
                      onClick={() => setIsCredentialVisible(false)}
                    >
                      <XIcon className="w-5" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="h-7 p-2"
                    onClick={() => setIsCredentialVisible(true)}
                  >
                    <KeyRoundIcon className="w-4 mr-1" />
                    Show Secret
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
