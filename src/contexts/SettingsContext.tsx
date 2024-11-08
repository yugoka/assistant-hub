"use client";
import SetttingsDialog from "@/components/settings/SettingsDialog";
import { UserSettings } from "@/types/UserSettings";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

interface SettingsContextType {
  userSettings: UserSettings | null;
  error: Error | null;
  isSettingsMenuOpen: boolean;
  setIsSettingsMenuOpen: Dispatch<SetStateAction<boolean>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export default function SettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState<boolean>(false);
  const userSettings = null;
  const error = null;

  return (
    <SettingsContext.Provider
      value={{ userSettings, error, isSettingsMenuOpen, setIsSettingsMenuOpen }}
    >
      <SetttingsDialog
        isSettingsMenuOpen={isSettingsMenuOpen}
        setIsSettingsMenuOpen={setIsSettingsMenuOpen}
        settings={userSettings}
      />
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
