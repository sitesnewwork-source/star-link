import Header from "@/components/starlink/Header";
import RoamHero from "@/components/starlink/RoamHero";
import Plans from "@/components/starlink/Plans";
import UseCasesCarousel from "@/components/starlink/UseCasesCarousel";
import StarlinkMini from "@/components/starlink/StarlinkMini";
import FeatureSections from "@/components/starlink/FeatureSections";
import BoxContents from "@/components/starlink/BoxContents";
import Testimonials from "@/components/starlink/Testimonials";
import Trial from "@/components/starlink/Trial";
import Footer from "@/components/starlink/Footer";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const Roam = () => {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEO title={seoData.roam.title} description={seoData.roam.description} path="/roam" type="product" />
      <Header />
      <RoamHero />
      <Breadcrumbs items={[{ label: t("roam.breadcrumb") }]} />
      <section id="plans">
        <Plans />
      </section>
      <UseCasesCarousel />
      <StarlinkMini />
      <section id="features">
        <FeatureSections />
      </section>
      <BoxContents />
      <Testimonials />
      <Trial />
      <Footer />
    </main>
  );
};

export default Roam;
