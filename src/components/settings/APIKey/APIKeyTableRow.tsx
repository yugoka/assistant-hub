import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Apikey } from "@/types/ApiKey";
import { FilePenIcon, Loader2, TrashIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  apikey: Apikey;
  onDelete: (apikey: Apikey) => Promise<void>;
  onEdit: (apikey: Apikey) => void;
};

const apiKeyModeDisplayName: { [key: string]: string } = {
  read: "Read-only",
  write: "Read/Write",
  all: "All",
};

export default function APIKeyTableRow({ apikey, onDelete, onEdit }: Props) {
  const [isDeleteInProgress, setIsDeleteInProgress] = useState<boolean>(false);

  return (
    <TableRow key={apikey.id}>
      <TableCell className="font-medium">{apikey.name}</TableCell>
      <TableCell>{apiKeyModeDisplayName[apikey.mode]}</TableCell>
      <TableCell>{formatDate(apikey.created_at)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(apikey)}>
            <FilePenIcon className="h-4 w-4" />
            <span className="sr-only">Edit API key</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-red-500"
            onClick={() => {
              setIsDeleteInProgress(true);
              onDelete(apikey);
            }}
          >
            {isDeleteInProgress ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
            <span className="sr-only">Delete API key</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
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
