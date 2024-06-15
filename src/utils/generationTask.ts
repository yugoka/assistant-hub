import { GenerationTaskAPIParams } from "@/types/api/GenerationTask";

//============
// ChatGPTを使ったちょっとしたタスクに使える便利関数
//============
export async function* fetchGenerationTask(
  requestBody: GenerationTaskAPIParams
) {
  const response = await fetch("/api/generation-task", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }

    yield decoder.decode(); // 最後のチャンクをデコード
  } else {
    throw new Error("Failed to fetch genetation task");
  }
}
