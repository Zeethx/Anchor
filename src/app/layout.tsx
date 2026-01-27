import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // Inter is fine
import "./globals.css";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anchor",
  description: "A quiet daily operating system for consistency.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Anchor",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zooming on mobile inputs
  themeColor: "black",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full"> 
      <body className={cn(inter.className, "h-full bg-background overscroll-none")}>
        <ToastProvider>
          <main className="mx-auto min-h-screen max-w-md bg-background px-4 pb-24 pt-6">
              {children}
          </main>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
