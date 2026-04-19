import { useTranslation } from "react-i18next";
import BusinessPage from "@/components/starlink/BusinessPage";
import hero from "@/assets/biz-gateway.jpg";

const BusinessCommunityGateway = () => {
  const { t } = useTranslation();
  return (
    <BusinessPage
      eyebrow={t("business.communityGateway.eyebrow")}
      title={t("business.communityGateway.title")}
      description={t("business.communityGateway.description")}
      heroImage={hero}
      vertical={t("business.communityGateway.vertical")}
      features={[
        { title: t("business.communityGateway.f1Title"), description: t("business.communityGateway.f1Desc") },
        { title: t("business.communityGateway.f2Title"), description: t("business.communityGateway.f2Desc") },
        { title: t("business.communityGateway.f3Title"), description: t("business.communityGateway.f3Desc") },
        { title: t("business.communityGateway.f4Title"), description: t("business.communityGateway.f4Desc") },
        { title: t("business.communityGateway.f5Title"), description: t("business.communityGateway.f5Desc") },
        { title: t("business.communityGateway.f6Title"), description: t("business.communityGateway.f6Desc") },
      ]}
    />
  );
};

export default BusinessCommunityGateway;
