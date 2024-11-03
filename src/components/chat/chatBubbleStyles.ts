export const chatBubbleStyles = {
  container: (isUser: boolean) =>
    `flex ${
      isUser ? "justify-end" : "justify-start"
    } animate-fade-in-fast py-0.5`,

  messageWrapper: "max-w-[95%] md:max-w-[85%] space-y-0",

  username: (isUser: boolean) =>
    `text-xs text-gray-500 dark:text-gray-400 ${
      isUser ? "text-right" : "text-left"
    } px-1`,

  bubble: (isUser: boolean) =>
    `w-full rounded-xl px-3 py-0.5 text-sm ${
      isUser
        ? "bg-blue-600 text-white dark:bg-blue-700 rounded-tr-none"
        : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-tl-none"
    }`,

  timestamp: (isUser: boolean) =>
    `text-xs text-gray-500 dark:text-gray-400 min-h-4 ${
      isUser ? "text-right" : "text-left"
    } px-1`,
};
