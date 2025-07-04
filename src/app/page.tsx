import Header from '@/components/layout/Header';
import HeroSection from '@/components/sections/HeroSection';
import FeaturedProperties from '@/components/sections/FeaturedProperties';
import CategoryShowcase from '@/components/sections/CategoryShowcase';
import FeaturesSection from '@/components/sections/FeaturesSection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="bg-white">
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
