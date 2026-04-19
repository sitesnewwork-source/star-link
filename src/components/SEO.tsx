import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  /** Path only, e.g. "/residential". Combined with origin for canonical/OG url. */
  path?: string;
  /** Absolute or relative image URL for social previews */
  image?: string;
  /** Page language (default ar) */
  lang?: "ar" | "en";
  /** og:type (default "website") */
  type?: "website" | "article" | "product";
  /** Optional JSON-LD structured data object(s) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Set to true to discourage indexing (admin pages) */
  noIndex?: boolean;
}

const DEFAULT_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/HaiairpyKfQOCEy1eJzQI44XYEr1/social-images/social-1776615444979-تنزيل_(1).webp";

const getOrigin = () => {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://salam-sparkle-story.lovable.app";
};

const SEO = ({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  lang = "ar",
  type = "website",
  jsonLd,
  noIndex = false,
}: SEOProps) => {
  const origin = getOrigin();
  const url = path ? `${origin}${path}` : (typeof window !== "undefined" ? window.location.href : origin);
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={lang === "ar" ? "ar_JO" : "en_US"} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {ldArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
