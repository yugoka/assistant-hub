import { Message } from "@/types/Message";
import { createClient } from "@/utils/supabase/server";

// スレッドIDによるメッセージ取得
interface GetMessagesByThreadIdOptions {
  threadID: string;
  page?: number;
  pageSize?: number;
}

export const getMessagesByThreadID = async ({
  threadID,
  page,
  pageSize = 10,
}: GetMessagesByThreadIdOptions): Promise<Message[]> => {
  if (!threadID) {
    throw new Error("Thread ID is not specified");
  }
  const supabase = createClient();

  let query = supabase.from("Messages").select("*").eq("thread_id", threadID);
  if (page !== undefined) {
    query = query.range((page - 1) * pageSize, page * pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }

  return data || [];
};
