import { createClient } from "@/utils/supabase/client";
import ThreadListItem from "./ThreadListItem";

export default async function ThreadList() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: threads } = await supabase
    .from("Threads")
    .select()
    .eq("id", user?.id);

  return (
    <>
      {threads &&
        threads.map((thread) => (
          <ThreadListItem key={thread.id}>{thread.name}</ThreadListItem>
        ))}
    </>
  );
}
