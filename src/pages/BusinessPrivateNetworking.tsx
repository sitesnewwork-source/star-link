import { useTranslation } from "react-i18next";
import BusinessPage from "@/components/starlink/BusinessPage";
import hero from "@/assets/biz-private.jpg";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const BusinessPrivateNetworking = () => {
  const { t } = useTranslation();
  return (
    <>
    <SEO title={seoData.businessPrivateNetworking.title} description={seoData.businessPrivateNetworking.description} path="/business/private-networking" />
    <BusinessPage
      eyebrow={t("business.privateNetworking.eyebrow")}
      title={t("business.privateNetworking.title")}
      description={t("business.privateNetworking.description")}
      heroImage={hero}
      vertical={t("business.privateNetworking.vertical")}
      features={[
        { title: t("business.privateNetworking.f1Title"), description: t("business.privateNetworking.f1Desc") },
        { title: t("business.privateNetworking.f2Title"), description: t("business.privateNetworking.f2Desc") },
        { title: t("business.privateNetworking.f3Title"), description: t("business.privateNetworking.f3Desc") },
        { title: t("business.privateNetworking.f4Title"), description: t("business.privateNetworking.f4Desc") },
        { title: t("business.privateNetworking.f5Title"), description: t("business.privateNetworking.f5Desc") },
        { title: t("business.privateNetworking.f6Title"), description: t("business.privateNetworking.f6Desc") },
      ]}
    />
  );
};

export default BusinessPrivateNetworking;
