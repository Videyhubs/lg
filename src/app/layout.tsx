import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkGuard - Smart Shortlink & Safelink Platform",
  description: "Professional link management with smart safelink protection, URL cloaking, analytics, and more. Facebook-safe redirect system with random article display.",
  keywords: ["shortlink", "safelink", "URL cloaking", "link management", "redirect", "analytics", "Facebook safe"],
  authors: [{ name: "LinkGuard" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "LinkGuard - Smart Shortlink Platform",
    description: "Professional link management with smart safelink protection and analytics.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkGuard - Smart Shortlink Platform",
    description: "Professional link management with smart safelink protection and analytics.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#6366f1" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
