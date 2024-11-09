"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button, buttonVariants } from "@/components/ui/button";
import { z } from "zod";
import { UseFormReturn, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authTypes } from "@/types/Tool";
import Link from "next/link";
import { Loader2, PencilIcon } from "lucide-react";
import InstructionExamples from "./InstructionExamples";
import { FormEvent, useState } from "react";
import { validateOpenAPISchema } from "@/utils/schema";

const openAPIJsonSchema = z.string().refine(
  (data: string) => {
    try {
      return validateOpenAPISchema(data);
    } catch {
      return false;
    }
  },
  {
    message: "Schema must be a valid OpenAPI 3 JSON or YAML schema.",
  }
);

export const toolEditorFormSchema = z
  .object({
    id: z.string().optional(),
    name: z
      .string()
      .min(2, {
        message: "Name must be at least 2 characters.",
      })
      .max(50, { message: "Name must be at most 50 characters." }),
    description: z
      .string()
      .min(2, {
        message: "Description must be at least 2 characters.",
      })
      .max(1000, { message: "Description must be at most 1000 characters." }),
    schema: openAPIJsonSchema,
    auth_type: z.enum(authTypes),
    credential: z.string().optional(),
    execution_count: z.number().optional(),
    success_count: z.number().optional(),
    average_execution_time: z.number().optional(),
    instruction_examples: z
      .array(
        z.object({
          text: z.string().min(2, {
            message: "Instruction example must be at least 2 characters.",
          }),
        })
      )
      .min(1, {
        message: "At least one instruction example is necessary.",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.auth_type === "Bearer") {
      if (!data.credential || data.credential.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["credential"],
          message: "Bearer Token is required for Bearer authentication.",
        });
      }
    } else if (data.auth_type === "Custom Header") {
      if (!data.credential || data.credential.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["credential"],
          message:
            "Custom Headers are required for Custom Header authentication.",
        });
      } else {
        try {
          JSON.parse(data.credential);
        } catch (e) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["credential"],
            message: "Custom Headers must be valid JSON.",
          });
        }
      }
    }
  });

type Props = {
  form: UseFormReturn<z.infer<typeof toolEditorFormSchema>, any, undefined>;
  onSubmit: (values: z.infer<typeof toolEditorFormSchema>) => Promise<void>;
  variant: "create" | "edit";
};

export default function ToolEditor({ form, onSubmit, variant }: Props) {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      setIsSaving(true);
      await form.handleSubmit(onSubmit)(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Watch the value of auth_type to conditionally render credential fields
  const authTypeValue = form.watch("auth_type");

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex justify-center">
        <Card className="w-full max-w-4xl md:m-3 border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>
                <PencilIcon className="inline-block mr-2 h-6 pb-1" />
                {variant === "create" ? "New" : "Edit"} Tool
              </span>
              <Link
                className={buttonVariants({ variant: "outline" })}
                href={`/tools/${form.getValues().id || ""}`}
              >
                Back
              </Link>
            </CardTitle>
            <CardDescription>Update the details of your API.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input id="name" placeholder="Enter tool name" {...field} />
                  </FormControl>
                  <FormDescription>snake_case is recommended.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px]"
                      placeholder="Provide a description for your tool"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe how to use the tool and the cases in which it
                    should be used.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Schema */}
            <FormField
              control={form.control}
              name="schema"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>OpenAPI Schema</FormLabel>
                  <FormControl>
                    <Textarea
                      id="schema"
                      placeholder="Paste your OpenAPI schema here"
                      className="min-h-[300px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A valid OpenAPI 3 JSON or YAML schema can be used.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Auth Type */}
            <FormField
              control={form.control}
              name="auth_type"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Authentication Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex items-center gap-4"
                    >
                      <Label
                        htmlFor="auth-none"
                        className="flex items-center gap-2"
                      >
                        <RadioGroupItem id="auth-none" value="None" />
                        None
                      </Label>
                      <Label
                        htmlFor="auth-bearer"
                        className="flex items-center gap-2"
                      >
                        <RadioGroupItem id="auth-bearer" value="Bearer" />
                        Bearer
                      </Label>
                      <Label
                        htmlFor="auth-custom-header"
                        className="flex items-center gap-2"
                      >
                        <RadioGroupItem
                          id="auth-custom-header"
                          value="Custom Header"
                        />
                        Custom Header
                      </Label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credential Fields */}
            {authTypeValue === "Bearer" && (
              <FormField
                control={form.control}
                name="credential"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Bearer Token</FormLabel>
                    <FormControl>
                      <Input
                        id="bearer_token"
                        placeholder="Enter your bearer token"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {authTypeValue === "Custom Header" && (
              <FormField
                control={form.control}
                name="credential"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Custom Headers (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        id="custom_headers"
                        placeholder='Enter custom headers in JSON format, e.g., {"Authorization": "Bearer TOKEN"}'
                        className="min-h-[120px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Instruction Examples */}
            <InstructionExamples form={form} />
          </CardContent>
          <CardFooter className="justify-end">
            <Button disabled={isSaving} type="submit">
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-1" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
