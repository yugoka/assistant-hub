export const getMemoryPrompt = (memory: string): string => {
  return `The following is the long-term memory. It includes things that the user has asked you to remember and information from past conversations that you have determined would be beneficial to remember.
[Memory]
${memory}
`;
};
