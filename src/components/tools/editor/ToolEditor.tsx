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
const OpenAPISchemaValidator = require("openapi-schema-validator").default;

const openAPIJsonSchema = z.string().refine(
  (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      const openAPIVersion = parsedData.openapi[0];
      const openAPISchemaValidator = new OpenAPISchemaValidator({
        version: openAPIVersion,
      });
      const validationResult = openAPISchemaValidator.validate(parsedData);
      return validationResult.errors.length === 0;
    } catch {
      return false;
    }
  },
  {
    message: "Schema must be a valid OpenAPI JSON schema.",
  }
);

export const toolEditorFormSchema = z.object({
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
  credential: z.string(),
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
                    A valid OpenAPI 2 or 3 JSON schema can be used.
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
                      defaultValue={field.value}
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
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* API Key */}
            <FormField
              control={form.control}
              name="credential"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      id="api_key"
                      placeholder="Enter your API key"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
