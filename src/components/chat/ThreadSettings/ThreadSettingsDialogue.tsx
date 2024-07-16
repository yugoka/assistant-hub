/**
 * v0 by Vercel.
 * @see https://v0.dev/t/C0k395ugxka
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { LockIcon, Settings2Icon } from "lucide-react";

export default function ThreadSettingsDialogue() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-5 top-1 rounded-full"
        >
          <Settings2Icon className="h-5 w-5" />
          <span className="sr-only">Thread Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Thread Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Thread Name" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="protected" />
            <Label htmlFor="protected" className="flex items-center">
              <LockIcon className="mr-2 h-4 w-4 text-primary" />
              Protected
            </Label>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea id="system-prompt" placeholder="Enter system prompt" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="enable-memory" />
            <Label htmlFor="enable-memory" className="flex items-center">
              Enable Memory
            </Label>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="memory">Memory</Label>
            <Textarea id="memory" placeholder="Enter memory" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="max-tokens">Maximum Memory Tokens</Label>
            <Input
              id="max-tokens"
              type="number"
              placeholder="Enter max tokens"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">Model Name</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="davinci">Davinci</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
