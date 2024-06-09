import { AuthType, Tool } from "@/types/Tool";
import { createClient } from "@/utils/supabase/server";

export interface CreateToolInput {
  name: string;
  description: string;
  schema: string;
  auth_type: AuthType;
  credential?: string;
}
export const createTool = async (input: CreateToolInput): Promise<Tool> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("Tools")
    .insert([input])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// IDによるツール取得
export interface GetToolByIDOptions {
  toolID: string;
  userID?: string;
}
export const getToolByID = async ({
  toolID,
  userID,
}: GetToolByIDOptions): Promise<Tool | null> => {
  if (!toolID) {
    throw new Error("Tool ID not specified");
  }

  const supabase = createClient();

  let query = supabase.from("Tools").select("*").eq("id", toolID);
  if (userID) {
    query = query.eq("user_id", userID);
  }

  const { data, error } = await query.single();

  if (error) {
    throw error;
  }

  return data || null;
};

// ツール更新
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
}
export const updateTool = async (input: UpdateToolInput) => {
  if (!input.id) {
    throw new Error("Tool ID not specified");
  }
  const supabase = createClient();

  const { data, error } = await supabase
    .from("Tools")
    .update({ ...input, id: undefined })
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw error;

  return data as Tool;
};
