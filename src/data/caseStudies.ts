import { supabase } from "@/integrations/supabase/client";
import { resolveCaseImage } from "./caseStudyImages";

export interface CaseStudyResult {
  value: string;
  label: string;
}

export interface CaseStudy {
  slug: string;
  company: string;
  industry: string;
  summary: string;
  metric: string;
  metricLabel: string;
  challenge: string;
  solution: string;
  results: CaseStudyResult[];
  quote?: { text: string; author: string; role: string };
  duration: string;
  location: string;
  image: string;
  imageKey: string;
}

interface DBRow {
  slug: string;
  company: string;
  industry: string;
  summary: string;
  metric: string;
  metric_label: string;
  challenge: string;
  solution: string;
  results: unknown;
  quote_text: string | null;
  quote_author: string | null;
  quote_role: string | null;
  duration: string;
  location: string;
  image: string;
}

const mapRow = (r: DBRow): CaseStudy => ({
  slug: r.slug,
  company: r.company,
  industry: r.industry,
  summary: r.summary,
  metric: r.metric,
  metricLabel: r.metric_label,
  challenge: r.challenge,
  solution: r.solution,
  results: Array.isArray(r.results) ? (r.results as CaseStudyResult[]) : [],
  quote: r.quote_text
    ? { text: r.quote_text, author: r.quote_author || "", role: r.quote_role || "" }
    : undefined,
  duration: r.duration,
  location: r.location,
  image: resolveCaseImage(r.image),
  imageKey: r.image,
});

export const fetchCaseStudies = async (): Promise<CaseStudy[]> => {
  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (error) throw error;
  return ((data as DBRow[]) || []).map(mapRow);
};

export const fetchCaseStudyBySlug = async (slug: string): Promise<CaseStudy | null> => {
  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as DBRow) : null;
};
