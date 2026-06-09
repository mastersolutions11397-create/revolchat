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
  title: "Revolchat — AI Bot Management Platform",
  description:
    "Manage your AI chatbots, connect social channels, and automate customer conversations — all in one place.",
  keywords: ["AI chatbot", "Telegram bot", "social media automation", "customer engagement", "AI agent", "business automation"],
  authors: [{ name: "Revolchat" }],
  creator: "Revolchat",
  publisher: "Revolchat",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://revolchat.com",
    title: "Revolchat — AI Bot Management Platform",
    description: "Manage AI chatbots and automate social media conversations.",
    siteName: "Revolchat",
    images: [
      {
        url: "/yetti/yetti_face.png",
        width: 1200,
        height: 630,
        alt: "Revolchat - AI Agent Integration Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Revolchat - AI Agent Integration Platform",
    description: "Connect your AI chatbot to Instagram, Telegram, and more platforms with Revolchat's powerful integration platform.",
    images: ["/yetti/yetti_face.png"],
    creator: "@revolchat",
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
      "@id": "https://revolchat.com/#organization",
      "name": "Revolchat",
      "url": "https://revolchat.com"
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://revolchat.com/#app",
      "name": "Revolchat",
      "url": "https://revolchat.com",
      "applicationCategory": "MarketingAutomationApplication",
      "operatingSystem": "Web",
      "description": "Revolchat is a social-media automation application that manages incoming messages, responds to customers, and handles conversations across supported platforms.",
      "provider": {
        "@id": "https://revolchat.com/#organization"
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
      "@id": "https://revolchat.com/#website",
      "url": "https://revolchat.com",
      "name": "Revolchat",
      "publisher": {
        "@id": "https://revolchat.com/#organization"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://revolchat.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Revolchat?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Revolchat is a social-media automation application that manages incoming messages, responds to customers, and handles conversations across supported platforms."
          }
        },
        {
          "@type": "Question",
          "name": "What does Revolchat help businesses do?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Revolchat automates social media messaging workflows, captures leads, answers FAQs, handles online bookings, and can help sell products directly through chat."
          }
        },
        {
          "@type": "Question",
          "name": "Which platforms does Revolchat support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Revolchat works with Meta messaging channels and is a verified Meta developer approved for business messaging automation and commerce use cases."
          }
        },
        {
          "@type": "Question",
          "name": "How does Revolchat capture leads?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Revolchat can connect to Google Sheets and automatically store lead data collected from conversations and social media message flows."
          }
        },
        {
          "@type": "Question",
          "name": "Can Revolchat be used to sell products?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Revolchat can guide customers through product selections and support conversational sales flows to help sell products via chat."
          }
        },
        {
          "@type": "Question",
          "name": "Does Revolchat handle appointment bookings?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Revolchat can manage online bookings by helping customers schedule appointments or reservations directly within chat."
          }
        },
        {
          "@type": "Question",
          "name": "Can Revolchat respond to frequently asked questions?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, businesses can configure FAQs and automated responses so Revolchat can answer common customer questions instantly, 24/7."
          }
        },
        {
          "@type": "Question",
          "name": "Who is Revolchat designed for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Revolchat is designed for businesses and creators who receive a high volume of social-media messages and want to automate customer communication and workflows."
          }
        },
        {
          "@type": "Question",
          "name": "Is Revolchat easy to set up?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Revolchat is beginner-friendly, with a simple onboarding flow that makes it easy to start automating messages quickly."
          }
        },
        {
          "@type": "Question",
          "name": "Does Revolchat offer different plans or pricing tiers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Revolchat offers multiple subscription plans so businesses can choose a package that fits their messaging volume and automation needs."
          }
        },
        {
          "@type": "Question",
          "name": "What makes Revolchat different from a basic chatbot?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Unlike simple chatbots, Revolchat is workflow-driven and can integrate with tools like Google Sheets to execute real operational tasks such as lead capture and order handling."
          }
        },
        {
          "@type": "Question",
          "name": "How does Revolchat benefit businesses?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Revolchat saves time, reduces manual message handling, improves response speed, and ensures customers receive consistent and accurate replies."
          }
        },
        {
          "@type": "Question",
          "name": "Can Revolchat integrate with external tools?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Revolchat can integrate with external tools such as Google Sheets to sync lead data and support automated workflows."
          }
        },
        {
          "@type": "Question",
          "name": "Is Revolchat approved for Meta messaging automation?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Revolchat is a verified Meta developer and is approved for social-media messaging automation and commerce-related use cases."
          }
        },
        {
          "@type": "Question",
          "name": "Is Revolchat suitable for small and growing businesses?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Revolchat is suitable for small and growing businesses and is designed to scale as messaging volume and automation needs increase."
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
