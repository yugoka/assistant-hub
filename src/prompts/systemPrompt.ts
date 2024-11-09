// 一旦雑に時間機能追加。日本標準時のみ
const fillDateInSystemPrompt = (prompt: string) => {
  return prompt.replace(
    "<japanese_time>",
    new Date().toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      timeZoneName: "short", // JST と表示
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  );
};
