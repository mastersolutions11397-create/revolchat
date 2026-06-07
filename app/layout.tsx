import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BotHub — AI Bot Management Platform",
  description:
    "Manage your AI chatbots, connect social channels, and automate customer conversations — all in one place.",
  keywords: ["AI chatbot", "Telegram bot", "social media automation", "customer engagement", "AI agent", "business automation"],
  authors: [{ name: "BotHub" }],
  creator: "BotHub",
  publisher: "BotHub",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bothub.ai",
    title: "BotHub — AI Bot Management Platform",
    description: "Manage AI chatbots and automate social media conversations.",
    siteName: "BotHub",
    images: [
      {
        url: "/yetti/yetti_face.png",
        width: 1200,
        height: 630,
        alt: "BotHub - AI Agent Integration Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BotHub - AI Agent Integration Platform",
    description: "Connect your AI chatbot to Instagram, Telegram, and more platforms with BotHub's powerful integration platform.",
    images: ["/yetti/yetti_face.png"],
    creator: "@bothub_ai",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://bothub.ai/#organization",
      "name": "BotHub",
      "url": "https://bothub.ai"
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://bothub.ai/#app",
      "name": "BotHub",
      "url": "https://bothub.ai",
      "applicationCategory": "MarketingAutomationApplication",
      "operatingSystem": "Web",
      "description": "BotHub is a social-media automation application that manages incoming messages, responds to customers, and handles conversations across supported platforms.",
      "provider": {
        "@id": "https://bothub.ai/#organization"
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
      "@id": "https://bothub.ai/#website",
      "url": "https://bothub.ai",
      "name": "BotHub",
      "publisher": {
        "@id": "https://bothub.ai/#organization"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://bothub.ai/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is BotHub?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "BotHub is a social-media automation application that manages incoming messages, responds to customers, and handles conversations across supported platforms."
          }
        },
        {
          "@type": "Question",
          "name": "What does BotHub help businesses do?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "BotHub automates social media messaging workflows, captures leads, answers FAQs, handles online bookings, and can help sell products directly through chat."
          }
        },
        {
          "@type": "Question",
          "name": "Which platforms does BotHub support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "BotHub works with Meta messaging channels and is a verified Meta developer approved for business messaging automation and commerce use cases."
          }
        },
        {
          "@type": "Question",
          "name": "How does BotHub capture leads?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "BotHub can connect to Google Sheets and automatically store lead data collected from conversations and social media message flows."
          }
        },
        {
          "@type": "Question",
          "name": "Can BotHub be used to sell products?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, BotHub can guide customers through product selections and support conversational sales flows to help sell products via chat."
          }
        },
        {
          "@type": "Question",
          "name": "Does BotHub handle appointment bookings?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, BotHub can manage online bookings by helping customers schedule appointments or reservations directly within chat."
          }
        },
        {
          "@type": "Question",
          "name": "Can BotHub respond to frequently asked questions?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, businesses can configure FAQs and automated responses so BotHub can answer common customer questions instantly, 24/7."
          }
        },
        {
          "@type": "Question",
          "name": "Who is BotHub designed for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "BotHub is designed for businesses and creators who receive a high volume of social-media messages and want to automate customer communication and workflows."
          }
        },
        {
          "@type": "Question",
          "name": "Is BotHub easy to set up?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, BotHub is beginner-friendly, with a simple onboarding flow that makes it easy to start automating messages quickly."
          }
        },
        {
          "@type": "Question",
          "name": "Does BotHub offer different plans or pricing tiers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, BotHub offers multiple subscription plans so businesses can choose a package that fits their messaging volume and automation needs."
          }
        },
        {
          "@type": "Question",
          "name": "What makes BotHub different from a basic chatbot?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Unlike simple chatbots, BotHub is workflow-driven and can integrate with tools like Google Sheets to execute real operational tasks such as lead capture and order handling."
          }
        },
        {
          "@type": "Question",
          "name": "How does BotHub benefit businesses?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "BotHub saves time, reduces manual message handling, improves response speed, and ensures customers receive consistent and accurate replies."
          }
        },
        {
          "@type": "Question",
          "name": "Can BotHub integrate with external tools?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, BotHub can integrate with external tools such as Google Sheets to sync lead data and support automated workflows."
          }
        },
        {
          "@type": "Question",
          "name": "Is BotHub approved for Meta messaging automation?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, BotHub is a verified Meta developer and is approved for social-media messaging automation and commerce-related use cases."
          }
        },
        {
          "@type": "Question",
          "name": "Is BotHub suitable for small and growing businesses?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, BotHub is suitable for small and growing businesses and is designed to scale as messaging volume and automation needs increase."
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
        className={`${inter.variable} antialiased`}
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
