import { Metadata } from "next";
import dynamic from "next/dynamic";
import Header from '@/components/layout/Header';
import HeroSection from '@/components/sections/HeroSection';
import CategoryShowcase from '@/components/sections/CategoryShowcase';
import FeaturesSection from '@/components/sections/FeaturesSection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/layout/Footer';

// Lazy load components for better performance
const FeaturedProperties = dynamic(() => import('@/components/sections/FeaturedProperties'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true,
});

export const metadata: Metadata = {
  title: "Larnacei Global Limited - Nigerian Property Marketplace",
  description: "Find your perfect property in Nigeria. Browse properties for sale, rentals, short stays, and land investments. Your trusted partner for real estate in Nigeria.",
  keywords: [
    "Nigeria property", "real estate Nigeria", "property for sale", 
    "rental properties", "land for sale", "short stays", "vacation rentals",
    "Lagos properties", "Abuja real estate", "Port Harcourt properties."
  ],
  openGraph: {
    title: "Larnacei Global Limited - Nigerian Property Marketplace",
    description: "Find your perfect property in Nigeria. Browse properties for sale, rentals, short stays, and land investments.",
    url: "https://larnacei.com",
    siteName: "Larnacei Property Platform",
    images: [
      {
        url: "/images/Larnacei_coloured.png",
        width: 1200,
        height: 630,
        alt: "Larnacei Property Platform - Nigerian Real Estate",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Larnacei Global Limited - Nigerian Property Marketplace",
    description: "Find your perfect property in Nigeria. Browse properties for sale, rentals, short stays, and land investments.",
    images: ["/images/Larnacei_coloured.png"],
  },
  alternates: {
    canonical: "https://larnacei.com",
  },
};

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Structured Data for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Larnacei Property Platform",
            "description": "Nigerian Property Marketplace",
            "url": "https://larnacei.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://larnacei.com/properties?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Larnacei Global Limited",
              "logo": {
                "@type": "ImageObject",
                "url": "https://larnacei.com/images/Larnacei_coloured.png"
              }
            }
          })
        }}
      />
      
      <Header />
      <main>
        <HeroSection />
        <FeaturedProperties />
        <CategoryShowcase />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
