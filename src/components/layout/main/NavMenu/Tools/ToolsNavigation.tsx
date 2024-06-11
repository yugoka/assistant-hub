import ToolsList from "./ToolsList";
import NewToolButton from "./NewToolButton";
import NewButton from "../NewButton";

export default function ToolsNavigation() {
  return (
    <>
      <div className="px-4 py-3">
        <NewButton href="/tools/new">New Tool</NewButton>
      </div>

      <nav className="space-y-1 px-4 flex-grow flex-shrink overflow-y-auto">
        <ToolsList query={{}} />
      </nav>
    </>
  );
}
