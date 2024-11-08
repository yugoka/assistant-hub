export const getMemoryPrompt = (memory: string): string => {
  return `The following is the long-term memory. It includes things that the user has asked you to remember and information from past conversations that you have determined would be beneficial to remember.
[Memory]
${memory}
`;
};

export type MemoryGenerationResponseFormat = {
  need_update: boolean;
  new_memory?: string;
};

export const getMemoryGenerationPrompt = (
  currentMemory: string,
  context: string
): { systemPrompt: string; userPrompt: string } => {
  return {
    systemPrompt: `[Summary] As an agent, you create long-term memory from user messages. I'll send user conversations; update ChatGPT's memory accordingly.

[Flow]
I'll provide current memory and a new user message.
Decide if memory needs updating. If so, send the full updated memory (add or remove info as needed).

[Important Rules]
- First, determine if an update is needed. Only output new_memory if necessary.
- Record only information important for user support or explicitly requested by the user.
- Use bullet points for memory entries.
- Add explicitly requested info to [Important]; others to [Normal].

[Additional Rules]
- Add new info at the end.
- If space is limited, remove older or less important info.
- When updating, send the full updated memory.
- If no update is needed, don't send new memory.
- Adjust the memory language to match the user’s language. If the user speaks Japanese, output the memory in Japanese.

[Output Format]
In the following JSON format:
type format = {
  need_update: boolean; // true if memory update is needed
  new_memory?: string | null; // only when need_update=true; output full memory text.
}

[Example Output]
If current memory is "The user's name is Yugo," and the user says, "I'm going to India next week. Also, remember that I prefer concise speech":
{
  "need_update": true,
  "new_memory": \`
[Important]
- The user's name is Yugo
- Yugo prefers concise speech

[Normal]
- Yugo is going to India next week
\`
}

Let's Start!`,
    userPrompt: `[Current Memory]
${currentMemory}

[User Input]
${context ? context : "[Important]\n\n[Normal]"}
`,
  };
};
