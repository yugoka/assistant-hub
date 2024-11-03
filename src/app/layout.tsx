import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Inter as FontSans } from "next/font/google";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

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
    <html lang="en" className={`${GeistSans.className} overflow-hidden`}>
      <body
        className={cn("bg-background font-sans antialiased", fontSans.variable)}
      >
        <main className="h-dvh flex flex-col items-center">{children}</main>
      </body>
    </html>
  );
}
