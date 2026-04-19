import { useTranslation } from "react-i18next";
import BusinessPage from "@/components/starlink/BusinessPage";
import hero from "@/assets/biz-aviation.jpg";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const BusinessAviation = () => {
  const { t } = useTranslation();
  return (
    <>
    <SEO title={seoData.businessAviation.title} description={seoData.businessAviation.description} path="/business/aviation" />
    <BusinessPage
      eyebrow={t("business.aviation.eyebrow")}
      title={t("business.aviation.title")}
      description={t("business.aviation.description")}
      heroImage={hero}
      vertical={t("business.aviation.vertical")}
      features={[
        { title: t("business.aviation.f1Title"), description: t("business.aviation.f1Desc") },
        { title: t("business.aviation.f2Title"), description: t("business.aviation.f2Desc") },
        { title: t("business.aviation.f3Title"), description: t("business.aviation.f3Desc") },
        { title: t("business.aviation.f4Title"), description: t("business.aviation.f4Desc") },
        { title: t("business.aviation.f5Title"), description: t("business.aviation.f5Desc") },
        { title: t("business.aviation.f6Title"), description: t("business.aviation.f6Desc") },
      ]}
    />
  );
};

export default BusinessAviation;
