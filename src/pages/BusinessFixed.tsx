import { useTranslation } from "react-i18next";
import BusinessPage from "@/components/starlink/BusinessPage";
import hero from "@/assets/biz-fixed.jpg";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const BusinessFixed = () => {
  const { t } = useTranslation();
  return (
    <>
    <SEO title={seoData.businessFixed.title} description={seoData.businessFixed.description} path="/business/fixed-site" />
    <BusinessPage
      eyebrow={t("business.fixed.eyebrow")}
      title={t("business.fixed.title")}
      description={t("business.fixed.description")}
      heroImage={hero}
      vertical={t("business.fixed.vertical")}
      features={[
        { title: t("business.fixed.f1Title"), description: t("business.fixed.f1Desc") },
        { title: t("business.fixed.f2Title"), description: t("business.fixed.f2Desc") },
        { title: t("business.fixed.f3Title"), description: t("business.fixed.f3Desc") },
        { title: t("business.fixed.f4Title"), description: t("business.fixed.f4Desc") },
        { title: t("business.fixed.f5Title"), description: t("business.fixed.f5Desc") },
        { title: t("business.fixed.f6Title"), description: t("business.fixed.f6Desc") },
      ]}
    />
    </>
  );
};

export default BusinessFixed;
