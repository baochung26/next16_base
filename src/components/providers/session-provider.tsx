"use client";

import { ReactNode } from "react";

/**
 * AuthSessionProvider - No longer using NextAuth SessionProvider
 * Token-based auth is handled directly in components
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
