import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/components/auth";
import { ToastProvider, ThemeProvider } from "@/components/shared";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Audio Stream | Personal Music Streaming",
  description:
    "Stream your personal music library from your phone to any device",
  keywords: ["music", "streaming", "audio", "webrtc", "personal"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
