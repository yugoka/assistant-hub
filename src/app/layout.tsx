import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Inter as FontSans } from "next/font/google";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeProviderWrapper";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Assistant Hub",
  description:
    "A web app for easily setting up an LLM-based assistant with various tools and functions",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.className} overflow-hidden`}
      // next-themesの警告対処用。他のElementに対する警告には影響しません
      suppressHydrationWarning
    >
      <body
        className={cn("bg-background font-sans antialiased", fontSans.variable)}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="h-dvh flex flex-col items-center">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
