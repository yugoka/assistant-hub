export const getMemoryPrompt = (memory: string): string => {
  return `The following is your long-term memory. It includes things that the user has asked you to remember and information from past conversations that you have determined would be beneficial to remember. After a conversation with a user, memories are dynamically added or removed.
[Assistant's Memory]
${memory}
`;
};

export type MemoryGenerationResponseFormat = {
  need_update: boolean;
  updated_memory?: string;
};

export const getMemoryGenerationPrompt = (
  currentMemory: string,
  context: string,
  maxMemoryTokens: number,
  currentTokenCount: number
): { systemPrompt: string; userPrompt: string } => {
  return {
    systemPrompt: `You are a ChatGPT agent managing long-term memory based on user messages. Update your memory by adding or deleting information whenever you think it will support future interactions, prioritizing important data and any information the User requests to remember. Delete less important information as needed to manage memory constraints.

Clearly specify who each piece of information is about by referring to the User as "User" and yourself as "I".

Track information with priority and recency to decide what to keep or remove.

You can use up to ${maxMemoryTokens} tokens. Current memory tokens: ${currentTokenCount} / ${maxMemoryTokens}.

Always output in this JSON format:
{
  "need_update": boolean, // true if memory update is needed
  "updated_memory": string | null // include full memory text when need_update is true
}
Ensure updated_memory always contains the full memory text when updating. Keep your responses concise to minimize token usage.`,
    userPrompt: `[Current Memory]
${currentMemory}

[User Input]
${context}
`,
  };
};
