import React from "react";
import ToolsList from "./ToolsList";
import NewToolButton from "./NewToolButton";

export default function ToolsNavigation() {
  return (
    <>
      <NewToolButton />
      <ToolsList query={{}} />
    </>
  );
}
