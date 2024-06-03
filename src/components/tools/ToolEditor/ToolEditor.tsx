"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ToolIcon } from "@/components/common/icons/ToolIcon";

export default function ToolEditor() {
  return (
    <form className="flex justify-center">
      <Card className="w-full max-w-3xl md:m-3 border-none shadow-none">
        <CardHeader>
          <CardTitle className="items-center">
            <ToolIcon className="inline-block mr-2 h-6 pb-1" />
            Edit Tool
          </CardTitle>
          <CardDescription>Update the details of your API.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter API name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a description for your API"
              className="min-h-[120px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="openapi">OpenAPI Schema</Label>
            <Textarea
              id="openapi"
              placeholder="Paste your OpenAPI schema here"
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label>Authentication Type</Label>
            <RadioGroup defaultValue="none" className="flex items-center gap-4">
              <Label htmlFor="auth-none" className="flex items-center gap-2">
                <RadioGroupItem id="auth-none" value="none" />
                None
              </Label>
              <Label htmlFor="auth-bearer" className="flex items-center gap-2">
                <RadioGroupItem id="auth-bearer" value="bearer" />
                Bearer
              </Label>
              <Label htmlFor="auth-basic" className="flex items-center gap-2">
                <RadioGroupItem id="auth-basic" value="basic" />
                Basic
              </Label>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              placeholder="Enter your API key here"
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button>Save</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
