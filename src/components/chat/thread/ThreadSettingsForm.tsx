import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dispatch, useEffect } from "react";
import { Thread } from "@/types/Thread";
import { RefetchOptions } from "react-query";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

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
    starred: z.boolean(),
    maximum_input_tokens: z.number().min(0, "Must be a positive number"),
    model_name: z.string(),
    custom_model_name: z.string().optional(),
  })
  .refine((data) => data.model_name !== "Other" || data.custom_model_name, {
    message: "Custom model name is required when 'Other' is selected",
    path: ["custom_model_name"],
  });

type ThreadSettingsFormValues = z.infer<typeof threadSettingsFormSchema>;

type ThreadSettingsFormProps = {
  defaultThread: Thread | null;
  setIsOpen: Dispatch<boolean>;
  refetch: (options?: RefetchOptions) => void;
};

const FormSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card className="mb-2">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

const FormRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-4 gap-4 items-center">{children}</div>
);

export default function ThreadSettingsForm({
  defaultThread,
  setIsOpen,
  refetch,
}: ThreadSettingsFormProps) {
  const form = useForm<ThreadSettingsFormValues>({
    resolver: zodResolver(threadSettingsFormSchema),
    defaultValues: getDefaultValues(defaultThread),
  });

  useEffect(() => {
    form.reset(getDefaultValues(defaultThread));
  }, [defaultThread?.id]);

  const selectedModelName = useWatch({
    control: form.control,
    name: "model_name",
  });

  const enableMemory = useWatch({
    control: form.control,
    name: "enable_memory",
  });

  const onSubmit = async (values: ThreadSettingsFormValues) => {
    try {
      if (values.model_name === "Other") {
        values.model_name = values.custom_model_name || "";
      }
      const { custom_model_name, ...submitValues } = values;

      await fetch(`/api/threads/${submitValues.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitValues),
      });
      setIsOpen(false);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  function getDefaultValues(thread: Thread | null): ThreadSettingsFormValues {
    if (thread) {
      return {
        ...thread,
        custom_model_name: MODEL_OPTIONS.includes(thread.model_name)
          ? ""
          : thread.model_name,
        model_name: MODEL_OPTIONS.includes(thread.model_name)
          ? thread.model_name
          : "Other",
      };
    } else {
      return {
        id: "",
        name: "",
        user_id: "",
        created_at: "",
        enable_memory: false,
        memory: "",
        maximum_memory_tokens: 1024,
        system_prompt: "",
        starred: false,
        maximum_input_tokens: 5120,
        model_name: "gpt-4",
        custom_model_name: "",
      };
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 flex-1 overflow-y-auto pr-6"
      >
        {/* Basic Settings Section */}
        <FormSection title="Basic Settings">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormRow>
                <FormLabel htmlFor="name" className="text-right">
                  Name
                </FormLabel>
                <div className="col-span-3 space-y-1">
                  <FormControl>
                    <Input id="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormRow>
            )}
          />

          <FormField
            control={form.control}
            name="starred"
            render={({ field }) => (
              <FormRow>
                <FormLabel htmlFor="starred" className="text-right">
                  Favorite
                </FormLabel>
                <div className="col-span-3 space-y-1">
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        id="starred"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="starred" className="ml-2">
                        Mark this thread as favorite to make it undeletable
                      </Label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormRow>
            )}
          />

          <FormField
            control={form.control}
            name="system_prompt"
            render={({ field }) => (
              <FormRow>
                <FormLabel htmlFor="system_prompt" className="text-right">
                  Prompt
                </FormLabel>
                <div className="col-span-3 space-y-1">
                  <FormControl>
                    <Textarea id="system_prompt" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormRow>
            )}
          />
        </FormSection>

        {/* Memory Settings Section */}
        <FormSection title="Memory Settings">
          <FormField
            control={form.control}
            name="enable_memory"
            render={({ field }) => (
              <FormRow>
                <FormLabel htmlFor="enable_memory" className="text-right">
                  Enable Memory
                </FormLabel>
                <div className="col-span-3 space-y-1">
                  <FormControl>
                    <div className="flex items-center">
                      <Checkbox
                        id="enable_memory"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="enable_memory" className="ml-2">
                        Use long-term memory powered by LLM
                      </Label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormRow>
            )}
          />

          {enableMemory && (
            <>
              <FormField
                control={form.control}
                name="memory"
                render={({ field }) => (
                  <FormRow>
                    <FormLabel htmlFor="memory" className="text-right">
                      Memory
                    </FormLabel>
                    <div className="col-span-3 space-y-1">
                      <FormControl>
                        <Textarea id="memory" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormRow>
                )}
              />

              <FormField
                control={form.control}
                name="maximum_memory_tokens"
                render={({ field }) => (
                  <FormRow>
                    <FormLabel
                      htmlFor="maximum_memory_tokens"
                      className="text-right"
                    >
                      Max Memory Tokens
                    </FormLabel>
                    <div className="col-span-3 space-y-1">
                      <FormControl>
                        <Input
                          id="maximum_memory_tokens"
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormRow>
                )}
              />
            </>
          )}
        </FormSection>

        {/* Model Settings Section */}
        <FormSection title="Model Settings">
          <FormField
            control={form.control}
            name="maximum_input_tokens"
            render={({ field }) => (
              <FormRow>
                <FormLabel
                  htmlFor="maximum_input_tokens"
                  className="text-right"
                >
                  Max Input Tokens
                </FormLabel>
                <div className="col-span-3 space-y-1">
                  <FormControl>
                    <Input
                      id="maximum_input_tokens"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormRow>
            )}
          />

          <FormField
            control={form.control}
            name="model_name"
            render={({ field }) => (
              <FormRow>
                <FormLabel htmlFor="model_name" className="text-right">
                  Model
                </FormLabel>
                <div className="col-span-3 space-y-1">
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
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
                </div>
              </FormRow>
            )}
          />

          {selectedModelName === "Other" && (
            <FormField
              control={form.control}
              name="custom_model_name"
              render={({ field }) => (
                <FormRow>
                  <FormLabel htmlFor="custom_model_name" className="text-right">
                    Custom Model Name
                  </FormLabel>
                  <div className="col-span-3 space-y-1">
                    <FormControl>
                      <Input id="custom_model_name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormRow>
              )}
            />
          )}
        </FormSection>

        {/* Form Footer */}
        <DialogFooter className="pt-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            {form.formState.isSubmitting ? (
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
  );
}
