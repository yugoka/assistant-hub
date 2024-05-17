import ThreadList from "./ThreadList";
import NewChatButton from "./NewChatButton";
import React from "react";

export default function ChatNavigation() {
  return (
    <>
      <NewChatButton />
      <ThreadList query={{}} />
    </>
  );
}
