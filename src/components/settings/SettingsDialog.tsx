"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserSettings } from "@/types/UserSettings";
import APIKeySettingsTab from "./APIKey/APIKeySettingsTab";
import UserSettingsTab from "./UserSettings/UserSettingsTab";

type Props = {
  isSettingsMenuOpen: boolean;
  setIsSettingsMenuOpen: Dispatch<SetStateAction<boolean>>;
  settings: UserSettings | null;
};

export default function SetttingsDialog({
  isSettingsMenuOpen,
  setIsSettingsMenuOpen,
  settings,
}: Props) {
  const [activeTab, setActiveTab] = useState("user-settings");

  return (
    <Dialog
      open={isSettingsMenuOpen}
      onOpenChange={(isOpen) => setIsSettingsMenuOpen(isOpen)}
    >
      <DialogContent className="h-full w-svw max-w-none sm:max-h-[500px] sm:w-[700px] sm:max-w-[600px] pt-0">
        <div className="flex flex-col">
          <Tabs
            defaultValue="user-settings"
            className="w-full flex-grow flex-shrink mt-3"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex flex-row items-center gap-5 border-b pb-2">
              <TabsList className="h-9">
                <TabsTrigger value="user-settings" className="h-7">
                  User Settings
                </TabsTrigger>
                <TabsTrigger value="api-key" className="h-7">
                  API Key
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="user-settings">
              <UserSettingsTab />
            </TabsContent>
            <TabsContent value="api-key">
              <APIKeySettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
