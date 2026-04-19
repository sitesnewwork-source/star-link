import aviationImg from "@/assets/case-aviation.jpg";
import maritimeImg from "@/assets/case-maritime.jpg";
import constructionImg from "@/assets/case-construction.jpg";
import healthcareImg from "@/assets/case-healthcare.jpg";
import energyImg from "@/assets/case-energy.jpg";
import educationImg from "@/assets/case-education.jpg";
import fallback from "@/assets/biz-cases.jpg";

export const CASE_IMAGES: Record<string, string> = {
  "case-aviation": aviationImg,
  "case-maritime": maritimeImg,
  "case-construction": constructionImg,
  "case-healthcare": healthcareImg,
  "case-energy": energyImg,
  "case-education": educationImg,
};

export const CASE_IMAGE_OPTIONS = Object.keys(CASE_IMAGES);

export const resolveCaseImage = (key: string): string => {
  if (!key) return fallback;
  if (key.startsWith("http") || key.startsWith("/")) return key;
  return CASE_IMAGES[key] || fallback;
};
