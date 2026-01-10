import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { GlobalErrorSuppressor } from "@/components/GlobalErrorSuppressor";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aether OS | Autonomous App Architect",
  description: "The next-generation autonomous application builder. Outperform your competition with self-healing infrastructure and neural architecture.",
  keywords: ["AI", "Autonomous", "Coding", "SaaS", "Builder", "No-code", "Low-code", "Developer Tools"],
  openGraph: {
    title: "Aether OS | Autonomous App Architect",
    description: "The next-generation autonomous application builder.",
    url: "https://superior.com",
    siteName: "Aether OS",
    images: [
      {
        url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "Aether OS Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aether OS | Autonomous App Architect",
    description: "Build software at the speed of thought.",
    images: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-background antialiased selection:bg-cyan-500/30 selection:text-cyan-200")}>
        <GlobalErrorSuppressor />
        {children}
        <Analytics />
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
