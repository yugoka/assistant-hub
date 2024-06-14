import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  apikey: string;
};

export default function GeneratedAPIKeyDialogue({
  open,
  setOpen,
  apikey,
}: Props) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent
        className="sm:max-w-[475px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>🎉 Here is your API key!</DialogTitle>
          <DialogDescription>
            The API key cannot be displayed again.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center grid-cols-[1fr_auto] gap-4">
            <Input type="text" value={apikey} readOnly className="font-mono" />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(apikey);
                setIsCopied(true);
                setTimeout(() => {
                  setIsCopied(false);
                }, 1000);
              }}
            >
              {isCopied ? (
                <CheckIcon className="w-5" />
              ) : (
                <CopyIcon className="w-5" />
              )}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="inline-block mr-auto border-none"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
