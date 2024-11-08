import { Thread } from "@/types/Thread";
import { createClient } from "@/utils/supabase/server";

// ==============
// スレッド作成
// ==============
export interface CreateThreadInput {
  id?: string;
  name: string;
  user_id: string;
}
export const createThread = async (
  input: CreateThreadInput
): Promise<Thread> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("threads")
    .insert([input])
    .select("*")
    .single();

  console.log(data);

  if (error) {
    throw error;
  }

  return data;
};

// ==============
// スレッド取得
// ==============
export interface GetThreadsOptions {
  userId?: string;
  page?: number;
  pageSize?: number;
}
export const getThreads = async ({
  userId,
  page,
  pageSize = 10,
}: GetThreadsOptions): Promise<Thread[]> => {
  const supabase = createClient();

  let query = supabase
    .from("threads")
    .select("*")
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
// IDによるスレッド取得
// ==============
export interface GetThreadByIDOptions {
  threadID: string;
}
export const getThreadByID = async ({
  threadID,
}: GetThreadByIDOptions): Promise<Thread | null> => {
  if (!threadID) {
    throw new Error("Thread ID not specified");
  }

  const supabase = createClient();

  const query = supabase
    .from("threads")
    .select("*")
    .eq("id", threadID)
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
// スレッド更新
// ==============
export interface UpdateThreadInput {
  id: string;
  name?: string;
  enable_memory?: boolean;
  maximum_memory_tokens?: number;
  memory?: string;
  system_prompt?: string;
  starred?: boolean;
  maximum_initial_input_tokens?: number;
  model_name?: string;
}
export const updateThread = async (input: UpdateThreadInput) => {
  if (!input.id) {
    throw new Error("Thread ID not specified");
  }
  const supabase = createClient();

  const { data, error } = await supabase
    .from("threads")
    .update({ ...input, id: undefined })
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw error;

  return data as Thread;
};

// ==============
// スレッド削除
// ==============
export interface DeleteThreadInput {
  id: string;
}
export const deleteThread = async (input: DeleteThreadInput) => {
  if (!input.id) {
    throw new Error("Thread ID not specified");
  }
  const supabase = createClient();

  const { error } = await supabase
    .from("threads")
    .delete()
    .eq("id", input.id)
    .eq("starred", false);

  if (error) throw error;

  return;
};
