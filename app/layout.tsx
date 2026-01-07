import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato } from "next/font/google";
import Script from "next/script";
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

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://yetti.ai/#organization",
      "name": "Yetti.ai",
      "url": "https://yetti.ai"
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://yetti.ai/#app",
      "name": "Yetti.ai",
      "url": "https://yetti.ai",
      "applicationCategory": "MarketingAutomationApplication",
      "operatingSystem": "Web",
      "description": "Yetti.ai is a social-media automation application that manages incoming messages, responds to customers, and handles conversations across supported platforms.",
      "provider": {
        "@id": "https://yetti.ai/#organization"
      },
      "featureList": [
        "Automated social media messaging workflows",
        "Lead capture connected to Google Sheets",
        "Product sales and conversational commerce",
        "Automated answers to FAQs",
        "Online appointment and booking handling"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://yetti.ai/#website",
      "url": "https://yetti.ai",
      "name": "Yetti.ai",
      "publisher": {
        "@id": "https://yetti.ai/#organization"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://yetti.ai/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Yetti.ai?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yetti.ai is a social-media automation application that manages incoming messages, responds to customers, and handles conversations across supported platforms."
          }
        },
        {
          "@type": "Question",
          "name": "What does Yetti.ai help businesses do?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yetti.ai automates social media messaging workflows, captures leads, answers FAQs, handles online bookings, and can help sell products directly through chat."
          }
        },
        {
          "@type": "Question",
          "name": "Which platforms does Yetti.ai support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yetti.ai works with Meta messaging channels and is a verified Meta developer approved for business messaging automation and commerce use cases."
          }
        },
        {
          "@type": "Question",
          "name": "How does Yetti.ai capture leads?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yetti.ai can connect to Google Sheets and automatically store lead data collected from conversations and social media message flows."
          }
        },
        {
          "@type": "Question",
          "name": "Can Yetti.ai be used to sell products?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Yetti.ai can guide customers through product selections and support conversational sales flows to help sell products via chat."
          }
        },
        {
          "@type": "Question",
          "name": "Does Yetti.ai handle appointment bookings?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Yetti.ai can manage online bookings by helping customers schedule appointments or reservations directly within chat."
          }
        },
        {
          "@type": "Question",
          "name": "Can Yetti.ai respond to frequently asked questions?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, businesses can configure FAQs and automated responses so Yetti.ai can answer common customer questions instantly, 24/7."
          }
        },
        {
          "@type": "Question",
          "name": "Who is Yetti.ai designed for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yetti.ai is designed for businesses and creators who receive a high volume of social-media messages and want to automate customer communication and workflows."
          }
        },
        {
          "@type": "Question",
          "name": "Is Yetti.ai easy to set up?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Yetti.ai is beginner-friendly, with a simple onboarding flow that makes it easy to start automating messages quickly."
          }
        },
        {
          "@type": "Question",
          "name": "Does Yetti.ai offer different plans or pricing tiers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Yetti.ai offers multiple subscription plans so businesses can choose a package that fits their messaging volume and automation needs."
          }
        },
        {
          "@type": "Question",
          "name": "What makes Yetti.ai different from a basic chatbot?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Unlike simple chatbots, Yetti.ai is workflow-driven and can integrate with tools like Google Sheets to execute real operational tasks such as lead capture and order handling."
          }
        },
        {
          "@type": "Question",
          "name": "How does Yetti.ai benefit businesses?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yetti.ai saves time, reduces manual message handling, improves response speed, and ensures customers receive consistent and accurate replies."
          }
        },
        {
          "@type": "Question",
          "name": "Can Yetti.ai integrate with external tools?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Yetti.ai can integrate with external tools such as Google Sheets to sync lead data and support automated workflows."
          }
        },
        {
          "@type": "Question",
          "name": "Is Yetti.ai approved for Meta messaging automation?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Yetti.ai is a verified Meta developer and is approved for social-media messaging automation and commerce-related use cases."
          }
        },
        {
          "@type": "Question",
          "name": "Is Yetti.ai suitable for small and growing businesses?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Yetti.ai is suitable for small and growing businesses and is designed to scale as messaging volume and automation needs increase."
          }
        }
      ]
    }
  ]
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SVWBWHXBSG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SVWBWHXBSG');
          `}
        </Script>
        <ClientProviders>
          {children}
          <Toaster richColors position="top-center" />
        </ClientProviders>
      </body>
    </html>
  );
}
