"use client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  cloneElement,
  createContext,
  ReactElement,
  useContext,
  useState,
} from "react";

type NavigationContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <NavigationContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}

export function SharedNavMenu({
  children: NavMenu,
}: {
  children: ReactElement;
}) {
  const { isOpen, setIsOpen } = useNavigation();

  return (
    <>
      <div className="hidden w-64 shrink-0 border-r bg-gray-100 dark:border-gray-800 dark:bg-gray-900 md:block">
        <div className="flex h-full flex-col justify-between pt-6">
          {NavMenu}
        </div>
      </div>

      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left">
            {cloneElement(NavMenu, {
              onMobileMenuClose: () => setIsOpen(false),
            })}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
