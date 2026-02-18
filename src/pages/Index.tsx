import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/landing/HeroSection';
import { LiveStatsSection } from '@/components/landing/LiveStatsSection';
import { NewsSection } from '@/components/landing/NewsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { RoadmapSection } from '@/components/landing/RoadmapSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { TechStackSection } from '@/components/landing/TechStackSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { usePageTitle } from '@/hooks/usePageTitle';

const Index = () => {
  usePageTitle('SkyServer - Free Game Server Hosting | Minecraft, Terraria, Rust & More');
  return (
    <Layout>
      <HeroSection />
      <LiveStatsSection />
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
