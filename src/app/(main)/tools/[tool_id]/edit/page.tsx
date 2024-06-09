"use client";
import Loader from "@/components/common/Loader";
import ToolEditor, {
  toolEditorFormSchema,
} from "@/components/tools/ToolEditor";
import { useTool } from "@/contexts/ToolContext";
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
    },
  });

  const onSubmit = async (values: z.infer<typeof toolEditorFormSchema>) => {
    try {
      const url = `/api/tools/${values.id}`;
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
        }),
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
