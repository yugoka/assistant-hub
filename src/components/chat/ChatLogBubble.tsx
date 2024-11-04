import { Message } from "@/types/Message";
import { parseMessageContent } from "@/utils/message";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownComponents } from "../markdown/MarkdownComponents";
import { chatBubbleStyles } from "./chatBubbleStyles";

type Props = {
  message: Message;
  username?: string;
};

export default function ChatLogBubble({ message, username }: Props) {
  const isUser = message.role === "user";
  const styles = chatBubbleStyles;

  return (
    <div className={styles.container(isUser)}>
      <div className={styles.messageWrapper}>
        <div className={styles.username(isUser)}>
          {username || message.role}
        </div>

        <div className={styles.bubble(isUser)}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {parseMessageContent(message.content)}
          </ReactMarkdown>
        </div>

        <div className={styles.timestamp(isUser)}>
          {message?.created_at ? (
            <span className="animate-fade-in-fast">
              {formatDate(message.created_at)}
            </span>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
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
