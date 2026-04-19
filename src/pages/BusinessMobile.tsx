import { useTranslation } from "react-i18next";
import BusinessPage from "@/components/starlink/BusinessPage";
import hero from "@/assets/biz-mobile.jpg";

const BusinessMobile = () => {
  const { t } = useTranslation();
  return (
    <BusinessPage
      eyebrow={t("business.mobile.eyebrow")}
      title={t("business.mobile.title")}
      description={t("business.mobile.description")}
      heroImage={hero}
      vertical={t("business.mobile.vertical")}
      features={[
        { title: t("business.mobile.f1Title"), description: t("business.mobile.f1Desc") },
        { title: t("business.mobile.f2Title"), description: t("business.mobile.f2Desc") },
        { title: t("business.mobile.f3Title"), description: t("business.mobile.f3Desc") },
        { title: t("business.mobile.f4Title"), description: t("business.mobile.f4Desc") },
        { title: t("business.mobile.f5Title"), description: t("business.mobile.f5Desc") },
        { title: t("business.mobile.f6Title"), description: t("business.mobile.f6Desc") },
      ]}
    />
  );
};

export default BusinessMobile;
