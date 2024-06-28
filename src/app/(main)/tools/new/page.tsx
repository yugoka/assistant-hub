"use client";
import ToolEditor, {
  toolEditorFormSchema,
} from "@/components/tools/editor/ToolEditor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateToolInput } from "@/services/tools";
import { useRouter } from "next/navigation";
import { Tool } from "@/types/Tool";
import { convertSchemaToJson, formatJsonSchema } from "@/utils/schema";

export default function ToolsPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof toolEditorFormSchema>>({
    resolver: zodResolver(toolEditorFormSchema),
    defaultValues: {
      name: "",
      description: "",
      schema: "",
      auth_type: "None",
      credential: "",
      instruction_examples: [{ text: "" }],
    },
  });

  const onSubmit = async (values: z.infer<typeof toolEditorFormSchema>) => {
    try {
      const reqBody: CreateToolInput = {
        ...values,
        instruction_examples: values.instruction_examples.map(
          (instruction) => instruction.text
        ),
        schema: formatJsonSchema(convertSchemaToJson(values.schema)),
      };

      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      if (!res.ok) {
        throw new Error("HTTP Error");
      }
      const newTool = (await res.json()) as Tool;
      console.log(newTool);
      router.push(`/tools/${newTool.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <ToolEditor form={form} onSubmit={onSubmit} variant="create" />
    </>
  );
}
