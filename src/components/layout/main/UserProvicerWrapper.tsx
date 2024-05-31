"use client";

import React, { ReactNode } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { AuthError } from "@supabase/supabase-js";

interface UserProviderWrapperProps {
  user: any | null;
  error: AuthError | null;
  children: ReactNode;
}

const UserProviderWrapper: React.FC<UserProviderWrapperProps> = ({
  user,
  error,
  children,
}) => {
  return (
    <UserProvider user={user} error={error}>
      {children}
    </UserProvider>
  );
};

export default UserProviderWrapper;
