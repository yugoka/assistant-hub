"use client";
import Loader from "@/components/common/Loader";
import ToolEditor, {
  toolEditorFormSchema,
} from "@/components/tools/editor/ToolEditor";
import { useTool } from "@/contexts/ToolContext";
import { UpdateToolInput } from "@/services/tools";
import { convertSchemaToJson, formatJsonSchema } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function ToolsEditPage() {
  const { tool, refetch } = useTool();
  const router = useRouter();

  if (!tool) {
    return <Loader />;
  }

  const form = useForm<z.infer<typeof toolEditorFormSchema>>({
    resolver: zodResolver(toolEditorFormSchema),
    defaultValues: {
      ...tool,
      instruction_examples: tool.instruction_examples.map((instructionText) => {
        return { text: instructionText };
      }),
    },
  });

  const onSubmit = async (values: z.infer<typeof toolEditorFormSchema>) => {
    try {
      if (!values.id) {
        throw new Error("Tool ID not specified");
      }

      const reqBody: UpdateToolInput = {
        ...values,
        // 型エラーを出さないために明示的に指定
        id: values.id,
        instruction_examples: values.instruction_examples.map(
          (instruction) => instruction.text
        ),
        schema: formatJsonSchema(convertSchemaToJson(values.schema)),
      };

      const url = `/api/tools/${values.id}`;
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error("HTTP Error!");
      }

      refetch();
      router.push(`/tools/${values.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return <ToolEditor variant="edit" form={form} onSubmit={onSubmit} />;
}
