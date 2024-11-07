import ThreadEditorProviderWrapper from "@/components/chat/thread/ThreadEditorProvider";
import { ReactNode } from "react";
export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ThreadEditorProviderWrapper>{children}</ThreadEditorProviderWrapper>;
}
