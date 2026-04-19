import Header from "@/components/starlink/Header";
import HomeHero from "@/components/starlink/HomeHero";
import HomeFeatures from "@/components/starlink/HomeFeatures";
import Trial from "@/components/starlink/Trial";
import Footer from "@/components/starlink/Footer";
import SEO from "@/components/SEO";
import { seoData, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEO
        title={seoData.home.title}
        description={seoData.home.description}
        path="/"
        jsonLd={[organizationJsonLd, websiteJsonLd]}
      />
      <Header />
      <HomeHero />
      <HomeFeatures />
      <Trial />
      <Footer />
    </main>
  );
};

export default Index;
