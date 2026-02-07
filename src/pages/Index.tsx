import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/landing/HeroSection';
import { NewsSection } from '@/components/landing/NewsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { RoadmapSection } from '@/components/landing/RoadmapSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { TechStackSection } from '@/components/landing/TechStackSection';
import { AboutSection } from '@/components/landing/AboutSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <NewsSection />
      <FeaturesSection />
      <RoadmapSection />
      <FAQSection />
      <TechStackSection />
      <AboutSection />
    </Layout>
  );
};

export default Index;
