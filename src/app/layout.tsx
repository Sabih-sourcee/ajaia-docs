import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/components/UserProvider";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Ajaia Docs",
  description: "A lightweight collaborative document editor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <ToastProvider>
          <UserProvider>{children}</UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
