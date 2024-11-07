import ErrorToast from "@/components/common/ErrorToast";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { Apikey } from "@/types/ApiKey";
import { useQuery } from "react-query";
import APIKeyTable from "./APIKeyTable";
import { apikeyEditorFormSchema, newApikeyDefaultValues } from "./ApiKeyEditor";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ApikeyEditor from "./ApiKeyEditor";
import { CreateApikeyInput, UpdateApikeyInput } from "@/services/apikeys";
import GeneratedAPIKeyDialogue from "./GeneratedAPIKeyDialogue";

export default function APIKeySettingsTab() {
  const [isApikeyEditorOpen, setIsAPikeyEditorOpen] = useState<boolean>(false);

  const [isGeneratedKeyDialogueOpen, setIsGeneratedKeyDialogueOpen] =
    useState<boolean>(false);
  const [generatedKey, setGeneratedKey] = useState<string>("");

  const form = useForm<z.infer<typeof apikeyEditorFormSchema>>({
    resolver: zodResolver(apikeyEditorFormSchema),
    defaultValues: newApikeyDefaultValues,
  });

  const { user } = useUser();

  const {
    data: apiKeys,
    isLoading,
    error,
    refetch,
  } = useQuery<Apikey[], Error>(["get-api-key-list", user?.id], async () => {
    if (user?.id) {
      const res = await fetch(`/api/apikeys?user_id=${user?.id}`);
      const data = await res.json();
      return data as Apikey[];
    } else {
      return [];
    }
  });

  const handleCreate = () => {
    form.reset(newApikeyDefaultValues);
    setIsAPikeyEditorOpen(true);
  };

  const handleEdit = (apikey: Apikey) => {
    form.reset({ ...apikey, formMode: "edit" });
    setIsAPikeyEditorOpen(true);
  };

  const handleDelete = async (apikey: Apikey) => {
    await fetch(`/api/apikeys/${apikey.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    refetch();
  };

  const handleSubmitApikeyEditor = async (
    values: z.infer<typeof apikeyEditorFormSchema>
  ) => {
    console.log(values);
    try {
      setIsAPikeyEditorOpen(false);
      // 作成
      if (values.formMode === "create") {
        const reqBody: CreateApikeyInput = {
          name: values.name || "New API Key",
          mode: values.mode,
        };
        const result = await fetch("/api/apikeys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        });

        if (!result.ok) throw new Error("HTTP Error!");

        const { key }: { key: string } = await result.json();

        if (key) {
          setGeneratedKey(key);
          setIsGeneratedKeyDialogueOpen(true);
          console.log(key);
        } else {
          throw new Error("API key has not been returned");
        }

        // 更新
      } else if (values.formMode === "edit") {
        if (!values.id) throw new Error("apikey id not specified");

        const reqBody = {
          name: values.name || "API Key",
          mode: values.mode,
        };

        const result = await fetch(`/api/apikeys/${values.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        });

        if (!result.ok) throw new Error("HTTP Error!");
      }

      // 更新が終わったら再度フェッチする
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleGeneratedKeyDialogue = (open: boolean) => {
    setIsGeneratedKeyDialogueOpen(open);
    // セキュリティ対策のためにデータを残さない
    if (!open) {
      setGeneratedKey("");
    }
  };

  if (error) {
    return <ErrorToast />;
  }

  if (isLoading || !apiKeys) {
    return (
      <div className="mt-32">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-full container flex flex-col mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">API Key Management</h1>
        <Button size="sm" onClick={handleCreate}>
          Create New API Key
        </Button>
      </div>
      <div className="border rounded-lg shadow-sm overflow-hidden">
        <APIKeyTable
          apiKeys={apiKeys}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
      <ApikeyEditor
        form={form}
        open={isApikeyEditorOpen}
        setOpen={setIsAPikeyEditorOpen}
        onSubmit={handleSubmitApikeyEditor}
      />
      {isGeneratedKeyDialogueOpen && (
        <GeneratedAPIKeyDialogue
          open={isGeneratedKeyDialogueOpen}
          setOpen={handleToggleGeneratedKeyDialogue}
          apikey={generatedKey}
        />
      )}
    </div>
  );
}
