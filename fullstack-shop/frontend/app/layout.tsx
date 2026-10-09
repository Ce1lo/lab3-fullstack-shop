import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "folio / shop — Everyday objects",
  description: "Một cửa hàng nhỏ cho những món đồ dùng mỗi ngày.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Providers>
          <Navbar />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-[var(--line)] bg-[#eee8de]">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <p>folio / shop · đồ dùng có chủ đích</p>
              <p>Next.js + Express · Lab 3</p>
            </div>
          </footer>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
