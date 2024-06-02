import NewButton from "../NewButton";
import React from "react";
import ToolsList from "./ToolsList";

export default function ToolsNavigation() {
  return (
    <>
      <NewButton href="/tools">New Tool</NewButton>
      <ToolsList query={{}} />
    </>
  );
}
