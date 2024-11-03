"use client";
import { Button } from "@/components/ui/button";
import { Loader2, TrashIcon } from "lucide-react";
import Link from "next/link";
import { MouseEvent, ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
  href: string;
  onClickDeleteButton?: (event: MouseEvent) => void;
  isSelected: boolean;
};

export default function NavMenuListItem({
  children,
  href,
  onClickDeleteButton,
  isSelected,
}: Props) {
  const [isDeleteButtonClicked, setIsDeleteButtonClicked] =
    useState<boolean>(false);

  const handleClickDeleteButton = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteButtonClicked(true);
    if (onClickDeleteButton) {
      onClickDeleteButton(e);
    }
  };

  const hoverStyles = `hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50`;
  const selectedStyles = `bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-50`;
  const defaultStyles = `text-gray-700 dark:text-gray-400`;

  return (
    <>
      <Link
        className={`flex w-full items-center justify-between rounded-md px-3 py-1 text-sm font-medium ${
          isSelected ? selectedStyles : defaultStyles
        } ${hoverStyles}`}
        href={href}
      >
        <span className="flex my-1 flex-grow flex-shrink items-center truncate">
          {children}
        </span>

        <Button
          variant="link"
          className="flex my-0 flex-grow-0 flex-shrink-0 rounded-full w-6 h-6 p-0 ml-2 hover:bg-gray-100 "
          onClick={handleClickDeleteButton}
        >
          {isDeleteButtonClicked ? (
            <Loader2 className="w-4 animate-spin" />
          ) : (
            <TrashIcon className="w-4" />
          )}
        </Button>
      </Link>
    </>
  );
}
