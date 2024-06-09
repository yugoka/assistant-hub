import { Thread } from "@/types/Thread";
import { createClient } from "@/utils/supabase/server";

// スレッド作成
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
    .from("Threads")
    .insert([input])
    .select("*")
    .single();

  console.log(data);

  if (error) {
    throw error;
  }

  return data;
};

// スレッド取得
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

  let query = supabase.from("Threads").select("*").order("created_at");
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

// IDによるスレッド取得
export interface GetThreadByIDOptions {
  threadID: string;
  userID?: string;
}
export const getThreadByID = async ({
  threadID,
  userID,
}: GetThreadByIDOptions): Promise<Thread | null> => {
  if (!threadID) {
    throw new Error("Thread ID not specified");
  }

  const supabase = createClient();

  let query = supabase.from("Threads").select("*").eq("id", threadID);
  if (userID) {
    query = query.eq("user_id", userID);
  }

  const { data, error } = await query.single();

  if (error) {
    throw error;
  }

  return data || null;
};
