import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { Apikey } from "@/types/ApiKey";
import APIKeyTableRow from "./APIKeyTableRow";

type Props = {
  apiKeys: Apikey[];
  onDelete: (apikey: Apikey) => Promise<void>;
  onEdit: (apikey: Apikey) => void;
};

const apiKeyModeDisplayName: { [key: string]: string } = {
  read: "Read-only",
  write: "Read and Write",
  all: "All",
};

export default function APIKeyTable({ apiKeys, onDelete, onEdit }: Props) {
  return (
    <div className="flex-shrink max-h-[300px] overflow-auto">
      <Table className="relative">
        <TableHeader className="sticky top-0 bg-background border-b">
          <TableRow>
            <TableHead>API Name</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="max-h-56">
          {apiKeys.map((apikey) => (
            <APIKeyTableRow
              key={apikey.id}
              apikey={apikey}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatDate(dateString: string): string {
  // Dateオブジェクトを作成
  const date = new Date(dateString);

  // 年、月、日を取得
  const year = date.getUTCFullYear();
  const month = ("0" + (date.getUTCMonth() + 1)).slice(-2); // 月は0始まりなので+1
  const day = ("0" + date.getUTCDate()).slice(-2);

  // yyyy-mm-dd形式にフォーマットして返す
  return `${year}-${month}-${day}`;
}
