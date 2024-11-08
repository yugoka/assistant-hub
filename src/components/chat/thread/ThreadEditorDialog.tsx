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
import { Dispatch, useEffect, useState } from "react";
import { Thread } from "@/types/Thread";
import { useForm, useWatch } from "react-hook-form";
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
import { RefetchOptions } from "react-query";
import { Loader2Icon } from "lucide-react";

// Define model options as a constant array
const MODEL_OPTIONS = ["gpt-4o", "gpt-4o-mini"];

const threadSettingsFormSchema = z
  .object({
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
    model_name: z.string(),
    custom_model_name: z.string().optional(),
  })
  .refine((data) => data.model_name !== "Other" || data.custom_model_name, {
    message: "Custom model name is required when 'Other' is selected",
    path: ["custom_model_name"],
  });

type ThreadSettingsFormValues = z.infer<typeof threadSettingsFormSchema>;

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
  const [isSaving, setIsSaving] = useState<boolean>(false);
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
      model_name: "gpt-4",
      custom_model_name: "",
    },
  });

  useEffect(() => {
    if (defaultThread) {
      form.reset({
        ...defaultThread,
        custom_model_name: MODEL_OPTIONS.includes(defaultThread.model_name)
          ? ""
          : defaultThread.model_name,
        model_name: MODEL_OPTIONS.includes(defaultThread.model_name)
          ? defaultThread.model_name
          : "Other",
      });
    }
  }, [defaultThread]);

  const selectedModelName = useWatch({
    control: form.control,
    name: "model_name",
  });

  const onSubmit = async (values: ThreadSettingsFormValues) => {
    setIsSaving(true);
    try {
      // If "Other" is selected, use the custom model name
      if (values.model_name === "Other") {
        values.model_name = values.custom_model_name || "";
      }
      // Remove custom_model_name from the values
      const { custom_model_name, ...submitValues } = values;

      await fetch(`/api/threads/${submitValues.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitValues),
      });
      // Proceed with form submission logic here
      setIsOpen(false);
      refetch();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogContent
        className="min-h-full sm:min-h-0 sm:max-w-[800px] overflow-y-auto"
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
                  <FormLabel htmlFor="name" className="text-right mt-1">
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
                  <FormLabel htmlFor="protected" className="text-right mt-1">
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
                  <FormLabel
                    htmlFor="system_prompt"
                    className="text-right mt-1"
                  >
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
                  <FormLabel
                    htmlFor="enable_memory"
                    className="text-right mt-1"
                  >
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
                  <FormLabel htmlFor="memory" className="text-right mt-1">
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
                    className="text-right mt-1"
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

            {/* Maximum Input Tokens */}
            <FormField
              control={form.control}
              name="maximum_input_tokens"
              render={({ field }) => (
                <FormItem className="grid items-center grid-cols-4 gap-4">
                  <FormLabel
                    htmlFor="maximum_input_tokens"
                    className="text-right mt-1"
                  >
                    Max Input Tokens
                  </FormLabel>
                  <FormControl className="col-span-3">
                    <Input id="maximum_input_tokens" type="number" {...field} />
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
                  <FormLabel htmlFor="model_name" className="text-right mt-1">
                    Model
                  </FormLabel>
                  <FormControl className="col-span-3">
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset custom_model_name when a predefined model is selected
                        if (value !== "Other") {
                          form.setValue("custom_model_name", "");
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Model Name */}
            {selectedModelName === "Other" && (
              <FormField
                control={form.control}
                name="custom_model_name"
                render={({ field }) => (
                  <FormItem className="grid items-center grid-cols-4 gap-4">
                    <FormLabel
                      htmlFor="custom_model_name"
                      className="text-right"
                    >
                      Custom Model Name
                    </FormLabel>
                    <FormControl className="col-span-3">
                      <Input id="custom_model_name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Form Footer */}
            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2Icon className="animate-spin mr-2 w-5 h-5" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
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
