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
