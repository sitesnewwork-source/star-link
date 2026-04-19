import Header from "@/components/starlink/Header";
import HomeHero from "@/components/starlink/HomeHero";
import HomeFeatures from "@/components/starlink/HomeFeatures";
import Trial from "@/components/starlink/Trial";
import Footer from "@/components/starlink/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <HomeHero />
      <HomeFeatures />
      <Trial />
      <Footer />
    </main>
  );
};

export default Index;
