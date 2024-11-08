import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dispatch } from "react";
import { Thread } from "@/types/Thread";
import { RefetchOptions } from "react-query";
import ThreadSettingsForm from "./ThreadSettingsForm";

type Props = {
  defaultThread: Thread | null;
  isOpen: boolean;
  setIsOpen: Dispatch<boolean>;
  refetch: (options?: RefetchOptions) => void;
};

export default function ThreadEditorDialog({
  isOpen,
  setIsOpen,
  defaultThread,
  refetch,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        autoFocus={false}
        key={defaultThread?.id}
        className="max-h-full md:max-h-[90vh] max-w-3xl overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>Thread Settings</DialogTitle>
        </DialogHeader>
        <ThreadSettingsForm
          defaultThread={defaultThread}
          setIsOpen={setIsOpen}
          refetch={refetch}
        />
      </DialogContent>
    </Dialog>
  );
}
