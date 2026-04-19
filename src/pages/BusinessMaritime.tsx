import { useTranslation } from "react-i18next";
import BusinessPage from "@/components/starlink/BusinessPage";
import hero from "@/assets/biz-maritime.jpg";

const BusinessMaritime = () => {
  const { t } = useTranslation();
  return (
    <BusinessPage
      eyebrow={t("business.maritime.eyebrow")}
      title={t("business.maritime.title")}
      description={t("business.maritime.description")}
      heroImage={hero}
      vertical={t("business.maritime.vertical")}
      features={[
        { title: t("business.maritime.f1Title"), description: t("business.maritime.f1Desc") },
        { title: t("business.maritime.f2Title"), description: t("business.maritime.f2Desc") },
        { title: t("business.maritime.f3Title"), description: t("business.maritime.f3Desc") },
        { title: t("business.maritime.f4Title"), description: t("business.maritime.f4Desc") },
        { title: t("business.maritime.f5Title"), description: t("business.maritime.f5Desc") },
        { title: t("business.maritime.f6Title"), description: t("business.maritime.f6Desc") },
      ]}
    />
  );
};

export default BusinessMaritime;
