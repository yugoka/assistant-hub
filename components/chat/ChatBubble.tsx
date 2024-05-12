import React, { use } from "react";

type Props = {
  username: string;
  variant: "user" | "ai";
  content: string;
  timestamp: Date;
};

export default async function ChatBubble({
  variant,
  content,
  timestamp,
  username,
}: Props) {
  return (
    <div className={`flex ${variant === "user" && "justify-end"}`}>
      <div className="max-w-[80%] space-y-1">
        <div
          className={`${
            variant === "user" && "text-right"
          } text-xs text-gray-500 dark:text-gray-400`}
        >
          {username}
        </div>
        <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm dark:bg-gray-800">
          {content}
        </div>
        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
          {formatDate(timestamp)}
        </div>
      </div>
    </div>
  );
}

const formatDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  // 日付の差を計算
  const diff = today.getTime() - targetDate.getTime();
  const dayDiff = diff / (1000 * 3600 * 24);

  // オプションを設定して、時間と分のみを表示
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  // 日付が今日なら時間を表示
  if (dayDiff < 1) {
    return date.toLocaleTimeString("ja-JP", timeOptions);
  }

  // 日付が昨日以前なら日付と時間を表示
  // 日付の表示も含めるために、オプションに year, month, day も追加
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...timeOptions, // 時間と分の表示オプションを追加
  };

  return date.toLocaleString("ja-JP", dateTimeOptions);
};
