import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, Crosshair, X, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import LeafletMap from "@/components/starlink/LeafletMapBoundary";
import type { CityPoint, ServiceKey } from "@/components/starlink/LeafletMap";
import heroImg from "@/assets/world-map.jpg";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

type View = "coverage" | "speeds";

const SERVICES: { v: ServiceKey | "all"; l: string; dotClass: string }[] = [
  { v: "all",         l: "all",         dotClass: "bg-service-neutral" },
  { v: "residential", l: "Residential", dotClass: "bg-service-residential" },
  { v: "roam",        l: "Roam",        dotClass: "bg-service-roam" },
  { v: "business",    l: "Business",    dotClass: "bg-service-business" },
];

// Country codes used internally + DB stores Arabic names. Map both ways.
const COUNTRY_CODES = ["all", "JO", "SA", "AE", "QA", "BH", "KW", "OM", "SY", "IQ", "LB"] as const;
type CountryCode = typeof COUNTRY_CODES[number];

// DB stores country as Arabic names; convert to/from codes.
const CODE_TO_AR: Record<Exclude<CountryCode, "all">, string> = {
  JO: "الأردن", SA: "السعودية", AE: "الإمارات", QA: "قطر", BH: "البحرين", KW: "الكويت", OM: "عُمان",
  SY: "سوريا", IQ: "العراق", LB: "لبنان",
};
const AR_TO_CODE: Record<string, CountryCode> = Object.fromEntries(
  Object.entries(CODE_TO_AR).map(([k, v]) => [v, k as CountryCode])
);

const Map = () => {
  const { t } = useTranslation();
  const { country: visitorCountry } = useCountry();
  const [view, setView] = useState<View>("coverage");
  const [service, setService] = useState<ServiceKey | "all">("all");
  // Default to the visitor's country (instead of "all") so the map opens focused on them
  const [country, setCountry] = useState<CountryCode>(visitorCountry as CountryCode);
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState<CityPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusToken, setFocusToken] = useState(0);
  const [showGovs, setShowGovs] = useState(false);
  const countryBarRef = useRef<HTMLDivElement>(null);
  const scrollCountryBar = (dir: "left" | "right") => {
    const el = countryBarRef.current;
    if (!el) return;
    const amount = Math.max(200, el.clientWidth * 0.7);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const countryLabel = (c: CountryCode) => c === "all" ? t("map.all") : t(`map.countries.${c}`);

  const loadCities = async () => {
    const { data, error } = await supabase
      .from("cities")
      .select("name, lat, lng, speed, status, services, image_url, country")
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: t("map.loadFailed"), description: error.message, variant: "destructive" });
    } else if (data) {
      setCities(data as CityPoint[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCities();

    const channel = supabase
      .channel("cities-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cities" },
        () => {
          loadCities();
          toast({ title: t("map.updatedTitle"), description: t("map.updatedDesc") });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFocusToken((t) => t + 1);
  }, [country]);

  const countryAr = country === "all" ? null : CODE_TO_AR[country];
  const byCountry = country === "all" ? cities : cities.filter((c) => c.country === countryAr);
  const visible = service === "all"
    ? byCountry
    : byCountry.filter((c) => c.services?.includes(service));
  const countryCounts: Record<string, number> = { all: cities.length };
  for (const c of cities) {
    const code = AR_TO_CODE[c.country || "الأردن"] || "JO";
    countryCounts[code] = (countryCounts[code] || 0) + 1;
  }
  const parseSpeed = (s: string): number | null => {
    const nums = (s || "").match(/\d+(?:\.\d+)?/g);
    if (!nums || nums.length === 0) return null;
    const vals = nums.map(Number);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };
  // Per-country stats: available / soon / avg speed (for available)
  const countryStats: Record<string, { available: number; soon: number; avgSpeed: number }> = {};
  const allBuckets = [{ code: "all" as CountryCode, list: cities }, ...COUNTRY_CODES.filter((c) => c !== "all").map((co) => ({
    code: co, list: cities.filter((c) => c.country === CODE_TO_AR[co as Exclude<CountryCode, "all">]),
  }))];
  for (const b of allBuckets) {
    const avail = b.list.filter((c) => c.status === "متوفر");
    const soon = b.list.filter((c) => c.status === "قريباً").length;
    const sv = avail.map((c) => parseSpeed(c.speed)).filter((v): v is number => v !== null);
    const avg = sv.length > 0 ? Math.round(sv.reduce((a, x) => a + x, 0) / sv.length) : 0;
    countryStats[b.code] = { available: avail.length, soon, avgSpeed: avg };
  }
  const availableCities = byCountry.filter((c) => c.status === "متوفر");
  const speedVals = availableCities.map((c) => parseSpeed(c.speed)).filter((v): v is number => v !== null);
  const avgSpeed = speedVals.length > 0 ? Math.round(speedVals.reduce((a, b) => a + b, 0) / speedVals.length) : 0;
  const summary = {
    total: byCountry.length,
    available: availableCities.length,
    soon: byCountry.filter((c) => c.status === "قريباً").length,
    avgSpeed,
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) {
      toast({ title: t("map.enterCityTitle"), variant: "destructive" });
      return;
    }
    const found = visible.find((r) => r.name.includes(query.trim()));
    toast({
      title: found ? `${found.name} — ${found.status === "متوفر" ? t("map.statusAvailable") : t("map.statusSoon")}` : t("map.notFoundTitle"),
      description: found ? t("map.foundDesc", { speed: found.speed }) : t("map.notFoundDesc"),
    });
  };

  const focusCountryLabel = country === "all" ? t("map.countries.JO") : countryLabel(country);

  return (
    <PageShell
      eyebrow={t("map.eyebrow")}
      title={t("map.title")}
      description={t("map.description")}
      heroImage={heroImg}
    >
      <Breadcrumbs items={[{ label: t("map.breadcrumb") }]} />
      <section className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="inline-flex border border-foreground/20 p-1">
            {([
              { v: "coverage", l: t("map.viewCoverage") },
              { v: "speeds", l: t("map.viewSpeeds") },
            ] as const).map((o) => (
              <button
                key={o.v}
                onClick={() => setView(o.v)}
                className={`h-10 px-6 text-sm tracking-wider transition-all ${view === o.v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                {o.l}
              </button>
            ))}
          </div>

          <form onSubmit={onSearch} className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-72">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("map.searchPlaceholder")}
                maxLength={100}
                className="w-full h-11 bg-transparent border border-foreground/20 px-4 pl-10 focus:border-foreground outline-none transition-colors text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <button type="submit" className="h-11 px-6 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider">
              {t("map.searchBtn")}
            </button>
          </form>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground tracking-wider shrink-0">{t("map.country")}</span>
          <button
            type="button"
            onClick={() => scrollCountryBar("left")}
            aria-label="Scroll countries left"
            className="shrink-0 hidden sm:inline-flex h-9 w-9 items-center justify-center border border-foreground/20 hover:border-foreground hover:bg-foreground/5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div ref={countryBarRef} className="flex-1 overflow-x-auto scrollbar-hide fade-edges-x -mx-1 px-1 scroll-smooth">
            <div className="flex gap-2 items-center w-max">
              {COUNTRY_CODES.map((co) => {
                const st = countryStats[co] || { available: 0, soon: 0, avgSpeed: 0 };
                const tooltip = `${t("map.available")}: ${st.available} • ${t("map.comingSoon")}: ${st.soon}${st.avgSpeed > 0 ? ` • ⌀ ${st.avgSpeed} Mbps` : ""}`;
                return (
                  <button
                    key={co}
                    onClick={() => setCountry(co)}
                    title={tooltip}
                    className={`shrink-0 h-auto py-1.5 px-3 text-xs tracking-wider border transition-all inline-flex flex-col items-center gap-0.5 ${country === co ? "border-foreground bg-foreground/5" : "border-foreground/20 hover:border-foreground/50"}`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {countryLabel(co)}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${country === co ? "bg-foreground text-background" : "bg-foreground/10 text-muted-foreground"}`}>
                        {countryCounts[co] || 0}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[9px] tracking-normal text-muted-foreground">
                      <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-service-residential" />{st.available}</span>
                      <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-status-soon" />{st.soon}</span>
                      {st.avgSpeed > 0 && <span className="opacity-80">⌀{st.avgSpeed}</span>}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => setFocusToken((tk) => tk + 1)}
                className="shrink-0 h-9 px-4 text-xs tracking-wider border border-foreground/20 hover:border-foreground hover:bg-foreground/5 transition-all inline-flex items-center gap-2"
                title={country === "all" ? t("map.focusOnRefit", { country: t("map.countries.JO") }) : t("map.focusOnRefit", { country: countryLabel(country) })}
              >
                <Crosshair className="w-3.5 h-3.5" />
                {t("map.focusOn", { country: focusCountryLabel })}
              </button>
              {country !== "all" && (
                <button
                  onClick={() => setCountry("all")}
                  className="shrink-0 h-9 px-4 text-xs tracking-wider border border-foreground/20 hover:border-destructive hover:text-destructive hover:bg-destructive/5 transition-all inline-flex items-center gap-2"
                >
                  <X className="w-3.5 h-3.5" />
                  {t("map.clearSelection")}
                </button>
              )}
              {(country !== "all" || service !== "all" || query.trim() !== "") && (
                <button
                  onClick={() => {
                    setCountry("all");
                    setService("all");
                    setQuery("");
                    setFocusToken((tk) => tk + 1);
                    toast({ title: t("map.resetTitle"), description: t("map.resetDesc") });
                  }}
                  className="shrink-0 h-9 px-4 text-xs tracking-wider border border-foreground/20 hover:border-foreground hover:bg-foreground/5 transition-all inline-flex items-center gap-2"
                  title={t("map.resetTooltip")}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t("map.resetAll")}
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollCountryBar("right")}
            aria-label="Scroll countries right"
            className="shrink-0 hidden sm:inline-flex h-9 w-9 items-center justify-center border border-foreground/20 hover:border-foreground hover:bg-foreground/5 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => {
              const count = s.v === "all"
                ? byCountry.length
                : byCountry.filter((c) => c.services?.includes(s.v as ServiceKey)).length;
              return (
                <button
                  key={s.v}
                  onClick={() => setService(s.v)}
                  className={`h-9 px-4 text-xs tracking-wider border transition-all inline-flex items-center gap-2 ${service === s.v ? "border-foreground bg-foreground/5" : "border-foreground/20 hover:border-foreground/50"}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${s.dotClass}`} />
                  {s.v === "all" ? t("map.all") : s.l}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${service === s.v ? "bg-foreground text-background" : "bg-foreground/10 text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowGovs((v) => !v)}
            className={`h-9 px-4 text-xs tracking-wider border transition-all ${showGovs ? "border-foreground bg-foreground/10" : "border-foreground/20 hover:border-foreground/50"}`}
          >
            {showGovs ? t("map.hideGovs") : t("map.showGovs")}
          </button>
        </div>

        {showGovs && (
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground border border-foreground/10 px-4 py-2">
            <span className="text-foreground">{t("map.govsCoverage")}</span>
            <span className="inline-flex items-center gap-1"><span className="w-4 h-3" style={{ background: "hsl(142,65%,65%)" }} />{t("map.covLow")}</span>
            <span className="inline-flex items-center gap-1"><span className="w-4 h-3" style={{ background: "hsl(142,65%,50%)" }} />{t("map.covMid")}</span>
            <span className="inline-flex items-center gap-1"><span className="w-4 h-3" style={{ background: "hsl(142,65%,38%)" }} />{t("map.covHigh")}</span>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-service-residential" /> Residential</span>
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-service-roam" /> Roam</span>
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-service-business" /> Business</span>
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-status-soon" /> {t("map.soon")}</span>
        </div>

        {(() => {
          const totalCov = summary.available + summary.soon;
          const availPct = totalCov > 0 ? (summary.available / totalCov) * 100 : 0;
          const soonPct = totalCov > 0 ? (summary.soon / totalCov) * 100 : 0;
          const r = 38;
          const circ = 2 * Math.PI * r;
          const availLen = (availPct / 100) * circ;
          const soonLen = (soonPct / 100) * circ;
          return (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border border-foreground/10 p-4">
                <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-2">{t("map.totalCities")}</div>
                <div className="text-2xl font-light">{summary.total}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{countryLabel(country)}</div>
              </div>
              <div className="border border-foreground/10 p-4 flex items-center gap-4">
                <div className="relative w-24 h-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--foreground) / 0.08)" strokeWidth="12" />
                    {totalCov > 0 && (
                      <>
                        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--service-residential))" strokeWidth="12"
                          strokeDasharray={`${availLen} ${circ - availLen}`} strokeDashoffset="0" />
                        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--status-soon))" strokeWidth="12"
                          strokeDasharray={`${soonLen} ${circ - soonLen}`} strokeDashoffset={-availLen} />
                      </>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-lg font-light leading-none">{Math.round(availPct)}%</div>
                    <div className="text-[9px] text-muted-foreground tracking-wider mt-0.5">{t("map.available")}</div>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{t("map.coverage")}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-service-residential" /> {t("map.available")}</span>
                    <span className="font-light">{summary.available}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-status-soon" /> {t("map.comingSoon")}</span>
                    <span className="font-light">{summary.soon}</span>
                  </div>
                </div>
              </div>
              <div className="border border-foreground/10 p-4">
                <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-2 inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-service-roam" /> {t("map.avgSpeed")}
                </div>
                <div className="text-2xl font-light">
                  {summary.avgSpeed > 0 ? `${summary.avgSpeed}` : "—"}
                  {summary.avgSpeed > 0 && <span className="text-sm text-muted-foreground mx-1">Mbps</span>}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {t("map.forAvailable", { count: summary.available })}
                </div>
              </div>
            </div>
          );
        })()}

        <div className="mb-8">
          <LeafletMap
            cities={visible}
            view={view}
            service={service}
            focusToken={focusToken}
            focusCountry={country === "all" ? "الأردن" : CODE_TO_AR[country]}
            showGovernorates={showGovs}
            selectedCountry={country === "all" ? "الكل" : CODE_TO_AR[country]}
            onServiceChange={setService}
            onCountryClick={(c) => {
              const code = AR_TO_CODE[c];
              if (code && code !== country) {
                setCountry(code);
                toast({ title: t("map.selectedCountryTitle", { country: countryLabel(code) }), description: t("map.selectedCountryDesc") });
              }
            }}
          />
        </div>

        <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px] border border-foreground/10">
          <thead>
            <tr className="border-b border-foreground/10">
              <th className="text-start p-4 text-sm font-light text-muted-foreground">{t("map.tableArea")}</th>
              <th className="p-4 text-sm font-light text-muted-foreground">{view === "coverage" ? t("map.tableStatus") : t("map.tableSpeed")}</th>
              <th className="p-4 text-sm font-light text-muted-foreground">{t("map.avgSpeed")}</th>
              <th className="hidden md:table-cell p-4 text-sm font-light text-muted-foreground">{t("map.tableRating", "التقييم")}</th>
              <th className="hidden md:table-cell p-4 text-sm font-light text-muted-foreground">{t("map.tableEta", "وقت التوصيل")}</th>
              <th className="p-4 text-sm font-light text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
            )}
            {!loading && visible.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">{t("map.noCities")}</td></tr>
            )}
            {visible.map((r) => {
              const sp = parseSpeed(r.speed);
              const isHigh = r.status === "متوفر" && sp !== null && sp >= 200;
              const stars = sp === null ? 0 : sp >= 200 ? 5 : sp >= 100 ? 4 : sp >= 50 ? 3 : sp >= 20 ? 2 : 1;
              const fastEta = ["الأردن", "الإمارات", "السعودية", "قطر", "البحرين", "الكويت"];
              const eta = r.status !== "متوفر"
                ? "—"
                : fastEta.includes(r.country || "")
                  ? t("map.eta24", "2–4 أيام عمل")
                  : t("map.eta57", "5–7 أيام عمل");
              return (
                <tr key={r.name} className="border-b border-foreground/10 last:border-0">
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center gap-2">
                      {r.name}
                      {isHigh && (
                        <span
                          className="text-[9px] tracking-wider px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: "hsl(45, 90%, 55%)", color: "hsl(30, 60%, 15%)" }}
                          title={`${Math.round(sp!)} Mbps`}
                        >
                          ⚡ {t("map.highSpeed")}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-center">
                    {view === "coverage"
                      ? (r.status === "متوفر" ? t("map.statusAvailable") : t("map.statusSoon"))
                      : r.speed}
                  </td>
                  <td className="p-4 text-sm text-center tabular-nums">
                    {sp !== null ? (
                      <span className="inline-flex items-baseline gap-1">
                        <span className="font-light">{Math.round(sp)}</span>
                        <span className="text-[10px] text-muted-foreground">Mbps</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="hidden md:table-cell p-4 text-center">
                    <span className="inline-flex items-center gap-0.5" title={`${stars}/5`} aria-label={`${stars}/5`}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={i <= stars ? "text-foreground" : "text-foreground/20"} style={{ fontSize: "13px", lineHeight: 1 }}>★</span>
                      ))}
                    </span>
                  </td>
                  <td className="hidden md:table-cell p-4 text-center text-xs text-muted-foreground whitespace-nowrap">
                    🚚 {eta}
                  </td>
                  <td className="p-4 text-center">
                    <Link to={`/checkout?plan=${service !== "all" ? service : "residential"}&address=${encodeURIComponent(r.name)}`} className="text-sm text-foreground hover:underline">
                      {t("map.orderNow")}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </section>
    </PageShell>
  );
};

export default Map;
