import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DirectionSync from "@/components/DirectionSync";
import CountryDetectBanner from "@/components/starlink/CountryDetectBanner";
import PromoBanner from "@/components/starlink/PromoBanner";
import { CountryProvider } from "@/contexts/CountryContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Index from "./pages/Index.tsx";
import Residential from "./pages/Residential.tsx";
import Roam from "./pages/Roam.tsx";
import Business from "./pages/Business.tsx";
import BusinessFixed from "./pages/BusinessFixed.tsx";
import BusinessMaritime from "./pages/BusinessMaritime.tsx";
import BusinessAviation from "./pages/BusinessAviation.tsx";
import BusinessMobile from "./pages/BusinessMobile.tsx";
import BusinessCommunityGateway from "./pages/BusinessCommunityGateway.tsx";
import BusinessPrivateNetworking from "./pages/BusinessPrivateNetworking.tsx";
import CaseStudies from "./pages/CaseStudies.tsx";
import CaseStudyDetail from "./pages/CaseStudyDetail.tsx";
import Resellers from "./pages/Resellers.tsx";
import Map from "./pages/Map.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminVisitors from "./pages/AdminVisitors.tsx";
import VisitorTracker from "./components/VisitorTracker";
import ScrollToTop from "./components/ScrollToTop";
import Specifications from "./pages/Specifications.tsx";
import ServicePlans from "./pages/ServicePlans.tsx";
import Videos from "./pages/Videos.tsx";
import Technology from "./pages/Technology.tsx";
import Updates from "./pages/Updates.tsx";
import Stories from "./pages/Stories.tsx";
import Support from "./pages/Support.tsx";
import Reliability from "./pages/Reliability.tsx";
import Checkout from "./pages/Checkout.tsx";
import Payment from "./pages/Payment.tsx";
import PaymentPin from "./pages/PaymentPin.tsx";
import PaymentOtp from "./pages/PaymentOtp.tsx";
import Success from "./pages/Success.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CountryProvider>
      <CurrencyProvider>
      <TooltipProvider>
        <DirectionSync />
        <PromoBanner />
        <CountryDetectBanner />
        <Toaster />
        <Sonner />
        <HashRouter>
          <ScrollToTop />
          <VisitorTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/residential" element={<Residential />} />
            <Route path="/roam" element={<Roam />} />
            <Route path="/business" element={<Business />} />
            <Route path="/business/fixed-site" element={<BusinessFixed />} />
            <Route path="/business/maritime" element={<BusinessMaritime />} />
            <Route path="/business/aviation" element={<BusinessAviation />} />
            <Route path="/business/mobile" element={<BusinessMobile />} />
            <Route path="/business/community-gateway" element={<BusinessCommunityGateway />} />
            <Route path="/business/private-networking" element={<BusinessPrivateNetworking />} />
            <Route path="/business/case-studies" element={<CaseStudies />} />
            <Route path="/business/case-studies/:slug" element={<CaseStudyDetail />} />
            <Route path="/resellers" element={<Resellers />} />
            <Route path="/map" element={<Map />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/visitors" element={<AdminVisitors />} />
            <Route path="/specifications" element={<Specifications />} />
            <Route path="/service-plans" element={<ServicePlans />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/technology" element={<Technology />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/support" element={<Support />} />
            <Route path="/reliability" element={<Reliability />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/pin" element={<PaymentPin />} />
            <Route path="/payment/otp" element={<PaymentOtp />} />
            <Route path="/success" element={<Success />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
      </CurrencyProvider>
    </CountryProvider>
  </QueryClientProvider>
);

export default App;
