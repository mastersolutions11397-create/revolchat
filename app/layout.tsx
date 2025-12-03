import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "yetti AI - AI Agent Integration Platform",
  description:
    "Connect your AI chatbot to Instagram, Telegram, and more platforms with yetti AI's powerful integration platform. Transform your social media presence with AI-powered customer engagement that works around the clock.",
  keywords: ["AI chatbot", "Instagram integration", "Telegram bot", "social media automation", "customer engagement", "AI agent", "business automation"],
  authors: [{ name: "yetti.ai" }],
  creator: "yetti.ai",
  publisher: "yetti.ai",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yetti.ai",
    title: "yetti AI - AI Agent Integration Platform",
    description: "Connect your AI chatbot to Instagram, Telegram, and more platforms with yetti AI's powerful integration platform.",
    siteName: "yetti.ai",
    images: [
      {
        url: "/yetti/yetti_face.png",
        width: 1200,
        height: 630,
        alt: "yetti AI - AI Agent Integration Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "yetti AI - AI Agent Integration Platform",
    description: "Connect your AI chatbot to Instagram, Telegram, and more platforms with yetti AI's powerful integration platform.",
    images: ["/yetti/yetti_face.png"],
    creator: "@yetti_ai",
  },
  icons: {
    icon: "/yetti/logo.png",
    shortcut: "/yetti/logo.png",
    apple: "/yetti/logo.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lato.variable} antialiased`}
      >
        <ClientProviders>
          {children}
          <Toaster richColors position="top-center" />
        </ClientProviders>
      </body>
    </html>
  );
}
