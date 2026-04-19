import Header from "@/components/starlink/Header";
import Hero from "@/components/starlink/Hero";
import Plans from "@/components/starlink/Plans";
import EmailSignup from "@/components/starlink/EmailSignup";
import UseCasesCarousel from "@/components/starlink/UseCasesCarousel";
import StarlinkMini from "@/components/starlink/StarlinkMini";
import FeatureSections from "@/components/starlink/FeatureSections";
import BoxContents from "@/components/starlink/BoxContents";
import Testimonials from "@/components/starlink/Testimonials";
import Trial from "@/components/starlink/Trial";
import Footer from "@/components/starlink/Footer";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Breadcrumbs items={[{ label: t("residential.breadcrumb") }]} />
      <Plans />
      <EmailSignup />
      <UseCasesCarousel />
      <StarlinkMini />
      <FeatureSections />
      <BoxContents />
      <Testimonials />
      <Trial />
      <Footer />
    </main>
  );
};

export default Index;
