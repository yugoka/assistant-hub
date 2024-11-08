import { ReactNode } from "react";

export default function HeaderBase({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-950 px-4 py-2 sticky top-0 z-10 ${className}`}
    >
      {children}
    </div>
  );
}
