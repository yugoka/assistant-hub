import { Apikey, ApikeyMode } from "@/types/ApiKey";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

// ==============
// APIキー作成
// ==============
export interface CreateApikeyInput {
  name: string;
  mode: ApikeyMode;
}
export const createApikey = async (
  input: CreateApikeyInput
): Promise<{ newColumn: Apikey; key: string }> => {
  const supabase = createClient();

  const newKey = uuidv4();

  console.log(newKey, input);

  const { data, error } = await supabase
    .from("apikeys")
    .insert([
      {
        ...input,
        // 送られた生のキーはSupabase側でハッシュ化される
        hashed_key: newKey,
      },
    ])
    .select("id, name, user_id, mode, created_at")
    .single();

  if (error) {
    throw error;
  }

  return {
    newColumn: data,
    key: newKey,
  };
};

// ==============
// APIキー取得
// ==============
export interface GetApikeysOptions {
  userId?: string;
  page?: number;
  pageSize?: number;
}
export const getApikeys = async ({
  userId,
  page,
  pageSize = 10,
}: GetApikeysOptions = {}): Promise<Apikey[]> => {
  const supabase = createClient();

  let query = supabase
    .from("apikeys")
    .select("id, name, user_id, mode, created_at")
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
// IDによるAPIキー取得
// ==============
export interface GetApikeyByIDOptions {
  id: number;
}
export const getApikeyByID = async ({
  id,
}: GetApikeyByIDOptions): Promise<Apikey | null> => {
  if (!id) {
    throw new Error("ApiKey ID not specified");
  }

  const supabase = createClient();
  const query = supabase
    .from("apikeys")
    .select("id, name, user_id, mode, created_at")
    .eq("id", id)
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
// APIキー更新
// ==============
export interface UpdateApikeyInput {
  id: number;
  name?: string;
  mode?: ApikeyMode;
}
export const updateApikey = async (input: UpdateApikeyInput) => {
  if (!input.id) {
    throw new Error("Apikey ID not specified");
  }
  const supabase = createClient();

  const { data, error } = await supabase
    .from("apikeys")
    .update({ ...input, id: undefined })
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw error;

  return data as Apikey;
};

// ==============
// APIキー削除
// ==============
export interface DeleteApikeyInput {
  id: number;
  name?: string;
  mode?: ApikeyMode;
}
export const deleteApikey = async (input: DeleteApikeyInput) => {
  if (!input.id) {
    throw new Error("Apikey ID not specified");
  }
  const supabase = createClient();

  const { error } = await supabase.from("apikeys").delete().eq("id", input.id);

  if (error) throw error;

  return;
};
