import ThreadList from "./ThreadList";
import NewButton from "../NewButton";
import React from "react";

export default function ChatNavigation() {
  return (
    <>
      <NewButton href="/chat">New Chat</NewButton>
      <ThreadList query={{}} />
    </>
  );
}
