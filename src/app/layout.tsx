import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://larnacei.com'),
  title: {
    default: "Larnacei Global Limited - Nigerian Property Marketplace",
    template: "%s | Larnacei Property Platform"
  },
  description: "Find your perfect property in Nigeria. From vacation stays to dream homes, land investments to rental properties. Your gateway to premium properties across Nigeria.",
  keywords: [
    "Nigeria", "property", "real estate", "rentals", "land sales", 
    "property sales", "short stays", "vacation rentals", "Lagos", 
    "Abuja", "Port Harcourt", "Kano", "Ibadan", "property investment",
    "real estate Nigeria", "property marketplace", "rental properties",
    "land for sale", "commercial properties", "residential properties"
  ],
  authors: [{ name: "Larnacei Global Limited" }],
  creator: "Larnacei Global Limited",
  publisher: "Larnacei Global Limited",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://larnacei.com",
    siteName: "Larnacei Property Platform",
    title: "Larnacei Global Limited - Nigerian Property Marketplace",
    description: "Find your perfect property in Nigeria. From vacation stays to dream homes, land investments to rental properties. Your gateway to premium properties across Nigeria.",
    images: [
      {
        url: "/images/Larnacei_coloured.png",
        width: 1200,
        height: 630,
        alt: "Larnacei Property Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Larnacei Global Limited - Nigerian Property Marketplace",
    description: "Find your perfect property in Nigeria. From vacation stays to dream homes, land investments to rental properties.",
    images: ["/images/Larnacei_coloured.png"],
    creator: "@larnacei",
    site: "@larnacei",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://larnacei.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7C0302" />
        <meta name="msapplication-TileColor" content="#7C0302" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "Larnacei Global Limited",
              "description": "Nigerian Property Marketplace",
              "url": "https://larnacei.com",
              "logo": "https://larnacei.com/images/Larnacei_coloured.png",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "NG",
                "addressRegion": "Lagos"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["English", "Yoruba", "Hausa", "Igbo"]
              },
              "sameAs": [
                "https://facebook.com/larnacei",
                "https://twitter.com/larnacei",
                "https://instagram.com/larnacei"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfairDisplay.variable} antialiased`}
      >
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
        <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'} />
        <PerformanceMonitor />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
