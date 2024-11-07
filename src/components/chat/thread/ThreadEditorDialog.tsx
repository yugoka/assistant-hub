import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Dispatch, useEffect } from "react";
import { Thread } from "@/types/Thread";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";

// Thread 型をそのまま利用して Zod スキーマを定義
const threadSettingsFormSchema: z.ZodType<Thread> = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  user_id: z.string(),
  created_at: z.string(),
  enable_memory: z.boolean(),
  memory: z.string(),
  maximum_memory_tokens: z.number().min(0, "Must be a positive number"),
  system_prompt: z.string(),
  protected: z.boolean(),
  maximum_input_tokens: z.number().min(0, "Must be a positive number"),
  model_name: z.string().optional(),
});

type ThreadSettingsFormValues = z.infer<typeof threadSettingsFormSchema>;

type Props = {
  defaultThread: Thread | null;
  isOpen: boolean;
  setIsOpen: Dispatch<boolean>;
};

export default function ThreadEditorDialog({
  isOpen,
  setIsOpen,
  defaultThread,
}: Props) {
  const form = useForm<ThreadSettingsFormValues>({
    resolver: zodResolver(threadSettingsFormSchema),
    defaultValues: defaultThread || {
      id: "",
      name: "",
      user_id: "",
      created_at: "",
      enable_memory: false,
      memory: "",
      maximum_memory_tokens: 1024,
      system_prompt: "",
      protected: false,
      maximum_input_tokens: 5120,
      model_name: "gpt-4o",
    },
  });

  useEffect(() => {
    if (defaultThread) {
      form.reset(defaultThread);
    }
  }, [defaultThread]);

  const onSubmit = (values: ThreadSettingsFormValues) => {
    try {
      console.log(values);
      // フォームの送信処理をここに記述します
      setIsOpen(false);
    } catch (error) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogContent
        className="sm:max-w-[600px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Thread Settings</DialogTitle>
          <DialogDescription>
            Customize the settings for this thread.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="grid gap-4 py-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid items-center grid-cols-4 gap-4">
                  <FormLabel htmlFor="name" className="text-right">
                    Name
                  </FormLabel>
                  <FormControl className="col-span-3">
                    <Input id="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Protected */}
            <FormField
              control={form.control}
              name="protected"
              render={({ field }) => (
                <FormItem className="grid items-center grid-cols-4 gap-4">
                  <FormLabel htmlFor="protected" className="text-right">
                    Protected
                  </FormLabel>
                  <FormControl className="col-span-3">
                    <div className="flex items-center">
                      <Checkbox
                        id="protected"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="protected" className="ml-2">
                        Restrict access to this thread
                      </Label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* System Prompt */}
            <FormField
              control={form.control}
              name="system_prompt"
              render={({ field }) => (
                <FormItem className="grid items-center grid-cols-4 gap-4">
                  <FormLabel htmlFor="system_prompt" className="text-right">
                    Prompt
                  </FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea id="system_prompt" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enable Memory */}
            <FormField
              control={form.control}
              name="enable_memory"
              render={({ field }) => (
                <FormItem className="grid items-center grid-cols-4 gap-4">
                  <FormLabel htmlFor="enable_memory" className="text-right">
                    Enable Memory
                  </FormLabel>
                  <FormControl className="col-span-3">
                    <div className="flex items-center">
                      <Checkbox
                        id="enable_memory"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="enable_memory" className="ml-2">
                        Store conversation history
                      </Label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Memory */}
            <FormField
              control={form.control}
              name="memory"
              render={({ field }) => (
                <FormItem className="grid items-center grid-cols-4 gap-4">
                  <FormLabel htmlFor="memory" className="text-right">
                    Memory
                  </FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea id="memory" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Maximum Memory Tokens */}
            <FormField
              control={form.control}
              name="maximum_memory_tokens"
              render={({ field }) => (
                <FormItem className="grid items-center grid-cols-4 gap-4">
                  <FormLabel
                    htmlFor="maximum_memory_tokens"
                    className="text-right"
                  >
                    Max Memory Tokens
                  </FormLabel>
                  <FormControl className="col-span-3">
                    <Input
                      id="maximum_memory_tokens"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Model */}
            <FormField
              control={form.control}
              name="model_name"
              render={({ field }) => (
                <FormItem className="grid items-center grid-cols-4 gap-4">
                  <FormLabel htmlFor="model_name" className="text-right">
                    Model
                  </FormLabel>
                  <FormControl className="col-span-3">
                    <Select
                      value={field.value || "gpt-3.5-turbo"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-3.5-turbo">
                          GPT-3.5 Turbo
                        </SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="davinci">Davinci</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* フォームのフッター */}
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
