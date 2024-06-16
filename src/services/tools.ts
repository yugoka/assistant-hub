import { AuthType, Tool } from "@/types/Tool";
import { createClient } from "@/utils/supabase/server";
import { getAndAverageEmbeddings } from "./embeddings";
import InstructionExamples from "@/components/tools/editor/InstructionExamples";

// ==============
// ツール作成
// ==============
export interface CreateToolInput {
  name: string;
  description: string;
  schema: string;
  auth_type: AuthType;
  credential?: string;
  instruction_examples: string[];
}
export const createTool = async (input: CreateToolInput): Promise<Tool> => {
  const supabase = createClient();

  // 使用例をベクトル化する
  const instructionExamplesEmbedding = await getAndAverageEmbeddings(
    input.instruction_examples
  );

  const processedInput: { [key: string]: any } = {
    ...input,
    instruction_examples_embedding: instructionExamplesEmbedding,
  };

  const { data, error } = await supabase
    .from("tools")
    .insert([processedInput])
    .select(
      `
      id,
      name,
      description,
      schema,
      created_at,
      user_id,
      execution_count,
      average_execution_time,
      credential,
      auth_type,
      success_count,
      instruction_examples
    `
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// ==============
// ツール取得
// ==============
export interface GetToolsOptions {
  userId?: string;
  page?: number;
  pageSize?: number;
}
export const getTools = async ({
  userId,
  page,
  pageSize = 10,
}: GetToolsOptions): Promise<Tool[]> => {
  const supabase = createClient();

  let query = supabase
    .from("tools")
    .select(
      `
      id,
      name,
      description,
      schema,
      created_at,
      user_id,
      execution_count,
      average_execution_time,
      credential,
      auth_type,
      success_count,
      instruction_examples
    `
    )
    .order("created_at", { ascending: false });
  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (page !== undefined) {
    query = query.range((page - 1) * pageSize, page * pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

// ==============
// IDによるツール取得
// ==============
export interface GetToolByIDOptions {
  toolID: string;
}
export const getToolByID = async ({
  toolID,
}: GetToolByIDOptions): Promise<Tool | null> => {
  if (!toolID) {
    throw new Error("Tool ID not specified");
  }

  const supabase = createClient();
  const query = supabase
    .from("tools")
    .select(
      `
    id,
    name,
    description,
    schema,
    created_at,
    user_id,
    execution_count,
    average_execution_time,
    credential,
    auth_type,
    success_count,
    instruction_examples
  `
    )
    .eq("id", toolID)
    .single();
  const { data, error } = await query;

  if (error) {
    // 行が見つかりません / UUIDが不正
    if (error.code === "PGRST116" || error.code === "22P02") {
      return null;
    } else {
      throw error;
    }
  }

  return data || null;
};

// ==============
// ツール更新
// ==============
export interface UpdateToolInput {
  id: string;
  name?: string;
  description?: string;
  schema?: string;
  auth_type?: AuthType;
  credential?: string;
  execution_count?: number;
  average_execution_time?: number;
  success_count?: number;
  instruction_examples?: string[];
}

export const updateTool = async (input: UpdateToolInput) => {
  if (!input.id) {
    throw new Error("Tool ID not specified");
  }
  const supabase = createClient();
  const processedInput: { [key: string]: any } = {
    ...input,
    id: undefined,
  };

  // 使用例をベクトル化する
  if (input.instruction_examples) {
    // 結果をキャッシュする
    const { data } = await supabase
      .from("tools")
      .select("instruction_examples")
      .eq("id", input.id)
      .single();

    if (
      JSON.stringify(data?.instruction_examples) !==
      JSON.stringify(input.instruction_examples)
    ) {
      processedInput.instruction_examples_embedding =
        await getAndAverageEmbeddings(input.instruction_examples);
    }
  }

  const { data, error } = await supabase
    .from("tools")
    .update(processedInput)
    .eq("id", input.id)
    .select(
      `
      id,
      name,
      description,
      schema,
      created_at,
      user_id,
      execution_count,
      average_execution_time,
      credential,
      auth_type,
      success_count,
      instruction_examples
    `
    )
    .single();

  if (error) throw error;

  return data as Tool;
};

// ==============
// ツール削除
// ==============
export interface DeleteToolInput {
  id: string;
}
export const deleteTool = async (input: DeleteToolInput) => {
  if (!input.id) {
    throw new Error("Tool ID not specified");
  }
  const supabase = createClient();

  const { error } = await supabase.from("tools").delete().eq("id", input.id);

  if (error) throw error;

  return;
};
