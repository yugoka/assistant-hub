import { createClient } from "@/utils/supabase/client";
import NewButton from "../NewButton";

export default function NewToolButton() {
  return <NewButton href="/tools/new">New Tool</NewButton>;
}
