import ThreadList from "./ThreadList";
import NewButton from "../NewButton";

export default function ChatNavigation() {
  return (
    <>
      <div className="px-4 py-3">
        <NewButton href="/chat">New Chat</NewButton>
      </div>

      <nav className="space-y-1 px-4 flex-grow flex-shrink overflow-y-auto">
        <ThreadList query={{}} />
      </nav>
    </>
  );
}
