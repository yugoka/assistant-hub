import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EyeIcon, FilePenIcon, KeyIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import { apikeyModes } from "@/types/ApiKey";
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const apikeyEditorFormSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  mode: z.enum(apikeyModes),
  // formの中にフロント表示用の情報を含めるのはアンチパターンかもしれない、どうなんだろう
  formMode: z.enum(["create", "edit"]),
});

export const newApikeyDefaultValues: z.infer<typeof apikeyEditorFormSchema> = {
  name: "",
  mode: "read",
  formMode: "create",
};

type Props = {
  form: UseFormReturn<z.infer<typeof apikeyEditorFormSchema>, any, undefined>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSubmit: (values: z.infer<typeof apikeyEditorFormSchema>) => void;
};

export default function ApikeyEditor({ open, setOpen, form, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {form.getValues().formMode === "create"
              ? "Create API Key"
              : "Edit API Key"}
          </DialogTitle>
          <DialogDescription>
            Configure your new API key with the desired permissions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="grid gap-5 py-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="Enter API key name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* mode */}
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Mode</FormLabel>
                  <FormControl>
                    <RadioGroup
                      defaultValue={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="read"
                          id="read"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="read"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-gray-100 bg-white p-4 hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-gray-900 [&:has([data-state=checked])]:border-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:peer-data-[state=checked]:border-gray-50 dark:[&:has([data-state=checked])]:border-gray-50"
                        >
                          <EyeIcon className="mb-3 h-6 w-6" />
                          Read-only
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="write"
                          id="write"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="write"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-gray-100 bg-white p-4 hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-gray-900 [&:has([data-state=checked])]:border-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:peer-data-[state=checked]:border-gray-50 dark:[&:has([data-state=checked])]:border-gray-50"
                        >
                          <FilePenIcon className="mb-3 h-6 w-6" />
                          Read/Write
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="all"
                          id="all"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="all"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-gray-100 bg-white p-4 hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-gray-900 [&:has([data-state=checked])]:border-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:peer-data-[state=checked]:border-gray-50 dark:[&:has([data-state=checked])]:border-gray-50"
                        >
                          <KeyIcon className="mb-3 h-6 w-6" />
                          All
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
