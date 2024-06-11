import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { FilePenIcon, TrashIcon } from "lucide-react";

export default function APIKeySettingsTab() {
  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">API Key Management</h1>
        <Button size="sm">Create New API Key</Button>
      </div>
      <div className="border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>API Name</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Acme API</TableCell>
              <TableCell>Production</TableCell>
              <TableCell>2023-04-15</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="icon">
                    <FilePenIcon className="h-4 w-4" />
                    <span className="sr-only">Edit API key</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="sr-only">Delete API key</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Analytics API</TableCell>
              <TableCell>Development</TableCell>
              <TableCell>2023-03-22</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="icon">
                    <FilePenIcon className="h-4 w-4" />
                    <span className="sr-only">Edit API key</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="sr-only">Delete API key</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Payments API</TableCell>
              <TableCell>Production</TableCell>
              <TableCell>2023-01-10</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="icon">
                    <FilePenIcon className="h-4 w-4" />
                    <span className="sr-only">Edit API key</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="sr-only">Delete API key</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
