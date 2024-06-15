export const getInstructionExampleGenerationPrompt = ({
  name,
  description,
  schema,
  instructions,
}: {
  name: string;
  description: string;
  schema: string;
  instructions: string[];
}) => {
  return `[Summary] I will introduce a tool for ChatGPT, and then please create an Instruction Example (natural language command).

[Flow]
- I will introduce the tool and provide a saved Instruction Example.
- Then, please output a new Instruction Example that is assumed for that tool.

[Rules]
- Create the Instruction Examples as if you are speaking to an assistant.
- If other Instruction Examples are provided, use the same language as those.
- If other Instruction Examples are provided, cover different cases, expressions, tones from them.
- If multiple Instruction Examples are provided, it is better to include prompts that evoke the need for the tool, not just commands related to the tool (e.g., for a tool that operates an air conditioner, "It's hot" etc.).

[Output Example] 
- For a tool that plays music: Can you play some relaxing jazz music? I need a break.
- For a tool that operates a home air conditioner: It's hot, can you set the living room air conditioner to 25 degrees?

[Output Rules]
The output should only include the generated Instruction Example. There is no need for prefaces like "Yes" or "Of course." Also, there is no need to enclose the result in quotes.

Then, let's start!

[User Input]
Tool Name: ${name}

Tool Description: ${description}

Tool OpenAPI Schema: ${schema}

Current Instruction Examples: 
${instructions.join("\n")}
`;
};
