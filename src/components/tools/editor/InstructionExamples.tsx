import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { z } from "zod";
import { toolEditorFormSchema } from "./ToolEditor";
import { BotIcon, InfoIcon, PlusIcon, TrashIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type InstructionExamplesProps = {
  form: UseFormReturn<z.infer<typeof toolEditorFormSchema>, any, undefined>;
};

function InstructionExamples({ form }: InstructionExamplesProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instruction_examples",
  });

  return (
    <div className="grid gap-4 mt-4">
      <FormLabel>
        Instruction Examples
        <Tooltip delayDuration={50}>
          <TooltipTrigger asChild>
            <InfoIcon className="inline ml-1 w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent className="max-w-96">
            <h3 className="text-lg font-bold mb-1">Instruction Examples</h3>
            This information is used by the assistant to select the appropriate
            tools in response to user commands. It is desirable to fill in the
            information to cover as many conceivable use cases as possible.
            Automatic generation by ChatGPT is also available.
            <br /> <br /> Each instruction example is vectorized, and their
            average is stored in a database for use in semantic searches.
          </TooltipContent>
        </Tooltip>
      </FormLabel>
      <FormDescription>
        Provide usage and instruction examples for the tool, such as "Turn on
        the air conditioner" or "Search for [topic]".
      </FormDescription>
      {fields.map((field, index) => (
        <FormItem key={field.id} className="grid gap-1">
          <>
            <div className="flex items-center gap-2">
              <FormControl>
                <Input
                  {...form.register(`instruction_examples.${index}.text`)}
                  placeholder={`Enter Instruction Example`}
                />
              </FormControl>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <BotIcon className="w-4 h-4" />
                    <span className="sr-only">Generate with ChatGPT</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Generate an instruction using ChatGPT
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete this instruction</TooltipContent>
              </Tooltip>
            </div>
            {form.formState.errors.instruction_examples?.[index]?.text &&
              form.formState.submitCount > 1 && (
                <FormMessage>
                  {
                    form.formState.errors.instruction_examples[index]?.text
                      ?.message
                  }
                </FormMessage>
              )}
          </>
        </FormItem>
      ))}
      <div>
        <Button className="p-3 h-9" onClick={() => append({ text: "" })}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  );
}

export default InstructionExamples;
