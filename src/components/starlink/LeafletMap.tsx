import { Fragment, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, Circle, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import jordanBorders from "@/data/jordan-borders.json";
import jordanGovernorates from "@/data/jordan-governorates.json";
import levantGovernorates from "@/data/levant-governorates.json";
import gulfBorders from "@/data/gulf-borders.json";
import levantBorders from "@/data/levant-borders.json";
import { coverageByEn, coverageColor } from "@/data/governorateCoverage";
import type { Feature, FeatureCollection, Geometry } from "geojson";

export type ServiceKey = "residential" | "roam" | "business";

export interface CityPoint {
  name: string;
  lat: number;
  lng: number;
  speed: string;
  status: "متوفر" | "قريباً";
  services?: ServiceKey[];
  image_url?: string | null;
  country?: string;
}

interface Props {
  cities: CityPoint[];
  view: "coverage" | "speeds";
  service: ServiceKey | "all";
  focusToken?: number;
  focusCountry?: string;
  showGovernorates?: boolean;
  onCountryClick?: (country: string) => void;
  selectedCountry?: string;
  onServiceChange?: (s: ServiceKey | "all") => void;
}

const cssVar = (name: string) => {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};
const hslToken = (name: string) => `hsl(${cssVar(name)})`;

const SERVICE_TOKEN: Record<ServiceKey, string> = {
  residential: "--service-residential",
  roam: "--service-roam",
  business: "--service-business",
};

const colorFor = (c: CityPoint, service: ServiceKey | "all") => {
  if (c.status === "قريباً") return hslToken("--status-soon");
  if (service !== "all") return hslToken(SERVICE_TOKEN[service]);
  const s = c.services || [];
  if (s.includes("business")) return hslToken(SERVICE_TOKEN.business);
  if (s.includes("roam")) return hslToken(SERVICE_TOKEN.roam);
  if (s.includes("residential")) return hslToken(SERVICE_TOKEN.residential);
  return hslToken(SERVICE_TOKEN.residential);
};

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
}

const JORDAN_BOUNDS_TUPLE: [[number, number], [number, number]] = [[29.18, 34.95], [33.37, 39.30]];
// Extended view covering Jordan + GCC + Levant countries
const REGION_BOUNDS = L.latLngBounds([16.0, 34.0], [38.0, 60.0]);

// Approximate country bounds (SW, NE)
const COUNTRY_BOUNDS: Record<string, L.LatLngBoundsExpression> = {
  "الأردن": [[29.18, 34.95], [33.37, 39.30]],
  "السعودية": [[16.35, 34.50], [32.15, 55.67]],
  "الإمارات": [[22.63, 51.50], [26.08, 56.40]],
  "قطر": [[24.47, 50.75], [26.18, 51.65]],
  "البحرين": [[25.78, 50.38], [26.32, 50.82]],
  "الكويت": [[28.52, 46.55], [30.10, 48.43]],
  "عُمان": [[16.65, 51.99], [26.39, 59.84]],
  "سوريا": [[32.30, 35.70], [37.32, 42.38]],
  "العراق": [[29.06, 38.79], [37.38, 48.57]],
  "لبنان": [[33.05, 35.10], [34.69, 36.62]],
};

const FocusCountry = ({ token, country }: { token?: number; country?: string }) => {
  const map = useMap();
  useEffect(() => {
    if (token === undefined) return;
    const b = country && COUNTRY_BOUNDS[country]
      ? L.latLngBounds(COUNTRY_BOUNDS[country] as [[number, number], [number, number]])
      : L.latLngBounds(JORDAN_BOUNDS_TUPLE);
    // Smooth fly with easing for a polished transition between countries
    map.flyToBounds(b, {
      padding: [40, 40],
      duration: 1.4,
      easeLinearity: 0.18,
      noMoveStart: false,
    });
  }, [token, country, map]);
  return null;
};

interface GovProps { name: string }

const LeafletMap = ({ cities, view, service, focusToken, focusCountry, showGovernorates, onCountryClick, selectedCountry, onServiceChange }: Props) => {
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  const govStyle = useMemo(
    () => (feature?: Feature<Geometry, GovProps>) => {
      const info = feature ? coverageByEn(feature.properties.name) : undefined;
      const color = info ? coverageColor(info.coverage) : "hsl(142, 30%, 60%)";
      return {
        color: "hsl(var(--primary))",
        weight: 1,
        fillColor: color,
        fillOpacity: 0.45,
      };
    },
    [],
  );

  const onEachGov = (feature: Feature<Geometry, GovProps>, layer: L.Layer) => {
    const info = coverageByEn(feature.properties.name);
    if (!info) return;
    const html = `
      <div style="font-family:inherit;text-align:right;min-width:140px">
        <div style="font-weight:600;margin-bottom:4px">${info.ar}</div>
        <div style="font-size:12px;color:#555">نسبة التغطية: <strong style="color:#000">${info.coverage}%</strong></div>
      </div>`;
    layer.bindTooltip(html, { sticky: true, direction: "top" });
    layer.bindPopup(html);
  };

  const SERVICE_LABEL: Record<ServiceKey, string> = { residential: "منزلي", roam: "تجوال", business: "أعمال" };
  const counts = {
    all: cities.length,
    residential: cities.filter((c) => c.services?.includes("residential")).length,
    roam: cities.filter((c) => c.services?.includes("roam")).length,
    business: cities.filter((c) => c.services?.includes("business")).length,
    available: cities.filter((c) => c.status === "متوفر").length,
    soon: cities.filter((c) => c.status === "قريباً").length,
  };

  return (
    <div className="w-full h-[480px] border border-foreground/10 overflow-hidden relative z-0">
      <MapContainer
        bounds={REGION_BOUNDS}
        boundsOptions={{ padding: [20, 20] }}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "hsl(var(--background))" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {showGovernorates && (
          <>
            <GeoJSON
              key="govs-jo"
              data={jordanGovernorates as FeatureCollection}
              style={govStyle as L.StyleFunction}
              onEachFeature={onEachGov as (f: Feature, l: L.Layer) => void}
            />
            <GeoJSON
              key={`govs-levant-${selectedCountry || "all"}`}
              data={levantGovernorates as FeatureCollection}
              style={govStyle as L.StyleFunction}
              onEachFeature={onEachGov as (f: Feature, l: L.Layer) => void}
            />
          </>
        )}

        <GeoJSON
          key={`gulf-${selectedCountry || "none"}`}
          data={gulfBorders as FeatureCollection}
          style={(feature) => {
            const name = (feature?.properties as { name?: string } | undefined)?.name;
            const ar: Record<string, string> = {
              "Saudi Arabia": "السعودية",
              "United Arab Emirates": "الإمارات",
              "Qatar": "قطر",
              "Bahrain": "البحرين",
              "Kuwait": "الكويت",
              "Oman": "عُمان",
            };
            const label = name ? (ar[name] || name) : "";
            const isSelected = selectedCountry && selectedCountry !== "الكل" && label === selectedCountry;
            if (isSelected) {
              return { color: "hsl(var(--primary))", weight: 3, fillColor: "hsl(var(--primary))", fillOpacity: 0.22, dashArray: "", className: "country-selected" };
            }
            return { color: "hsl(var(--primary))", weight: 1.5, fillColor: "hsl(var(--primary))", fillOpacity: 0.04, dashArray: "4 4" };
          }}
          onEachFeature={(feature, layer) => {
            const name = (feature.properties as { name?: string } | null)?.name;
            const ar: Record<string, string> = {
              "Saudi Arabia": "السعودية",
              "United Arab Emirates": "الإمارات",
              "Qatar": "قطر",
              "Bahrain": "البحرين",
              "Kuwait": "الكويت",
              "Oman": "عُمان",
            };
            const label = name ? (ar[name] || name) : "";
            const isSelected = selectedCountry && selectedCountry !== "الكل" && label === selectedCountry;
            if (label) {
              layer.bindTooltip(label, { sticky: true, direction: "top", className: "country-border-tooltip" });
            }
            const path = layer as L.Path;
            const baseStyle = isSelected
              ? { weight: 3, fillOpacity: 0.22, dashArray: "" }
              : { weight: 1.5, fillOpacity: 0.04, dashArray: "4 4" };
            const hoverStyle = isSelected
              ? { weight: 4, fillOpacity: 0.32, dashArray: "" }
              : { weight: 3, fillOpacity: 0.18, dashArray: "" };
            layer.on({
              mouseover: () => path.setStyle(hoverStyle),
              mouseout: () => path.setStyle(baseStyle),
              click: () => { if (label && onCountryClick) onCountryClick(label); },
            });
          }}
        />

        <GeoJSON
          key={`levant-${selectedCountry || "none"}`}
          data={levantBorders as FeatureCollection}
          style={(feature) => {
            const name = (feature?.properties as { name?: string } | undefined)?.name;
            const ar: Record<string, string> = { "Syria": "سوريا", "Iraq": "العراق", "Lebanon": "لبنان" };
            const label = name ? (ar[name] || name) : "";
            const isSelected = selectedCountry && selectedCountry !== "الكل" && label === selectedCountry;
            if (isSelected) {
              return { color: "hsl(var(--primary))", weight: 3, fillColor: "hsl(var(--primary))", fillOpacity: 0.22, dashArray: "" };
            }
            return { color: "hsl(var(--primary))", weight: 1.5, fillColor: "hsl(var(--primary))", fillOpacity: 0.04, dashArray: "4 4" };
          }}
          onEachFeature={(feature, layer) => {
            const name = (feature.properties as { name?: string } | null)?.name;
            const ar: Record<string, string> = { "Syria": "سوريا", "Iraq": "العراق", "Lebanon": "لبنان" };
            const label = name ? (ar[name] || name) : "";
            const isSelected = selectedCountry && selectedCountry !== "الكل" && label === selectedCountry;
            if (label) {
              layer.bindTooltip(label, { sticky: true, direction: "top", className: "country-border-tooltip" });
            }
            const path = layer as L.Path;
            const baseStyle = isSelected
              ? { weight: 3, fillOpacity: 0.22, dashArray: "" }
              : { weight: 1.5, fillOpacity: 0.04, dashArray: "4 4" };
            const hoverStyle = isSelected
              ? { weight: 4, fillOpacity: 0.32, dashArray: "" }
              : { weight: 3, fillOpacity: 0.18, dashArray: "" };
            layer.on({
              mouseover: () => path.setStyle(hoverStyle),
              mouseout: () => path.setStyle(baseStyle),
              click: () => { if (label && onCountryClick) onCountryClick(label); },
            });
          }}
        />

        <GeoJSON
          data={jordanBorders as FeatureCollection}
          style={{ color: "hsl(var(--primary))", weight: 2, fillColor: "hsl(var(--primary))", fillOpacity: showGovernorates ? 0 : 0.05, dashArray: "4 4" }}
          interactive={false}
        />

        <FocusCountry token={focusToken} country={focusCountry} />

        {cities.map((c) => {
          const color = colorFor(c, service);
          const speedNums = (c.speed || "").match(/\d+(?:\.\d+)?/g);
          const avgSp = speedNums ? speedNums.map(Number).reduce((a, b) => a + b, 0) / speedNums.length : 0;
          const isHigh = c.status === "متوفر" && avgSp >= 200;
          const GOLD = "hsl(45, 90%, 55%)";
          return (
            <Fragment key={c.name}>
              <Circle
                center={[c.lat, c.lng]}
                radius={view === "coverage" ? 18000 : 12000}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 1 }}
              />
              {isHigh && (
                <CircleMarker
                  center={[c.lat, c.lng]}
                  radius={10}
                  pathOptions={{ color: GOLD, fillColor: GOLD, fillOpacity: 0, weight: 2 }}
                  interactive={false}
                />
              )}
              <CircleMarker
                center={[c.lat, c.lng]}
                radius={6}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent={false}>
                  <span style={{ fontSize: 12 }}>
                    {c.name}{isHigh ? " ⚡" : ""}
                  </span>
                </Tooltip>
                <Popup>
                  <div style={{ fontFamily: "inherit", textAlign: "right", minWidth: 200 }}>
                    {c.image_url && (
                      <img
                        src={c.image_url}
                        alt={c.name}
                        style={{ width: "100%", height: 110, objectFit: "cover", marginBottom: 8, borderRadius: 2 }}
                        loading="lazy"
                      />
                    )}
                    <div style={{ fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      {isHigh && (
                        <span style={{ fontSize: 10, background: GOLD, color: "hsl(30,60%,15%)", padding: "2px 6px", borderRadius: 999, fontWeight: 600 }}>
                          ⚡ سرعة عالية
                        </span>
                      )}
                      <span>{c.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#555", marginBottom: 6, display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span>{c.status === "متوفر" ? "✓ متوفر" : "⏳ قريباً"}</span>
                      <strong style={{ color: "#000" }}>{c.speed}</strong>
                    </div>
                    {(() => {
                      // Star rating from average speed: 0–50→2, 50–100→3, 100–200→4, 200+→5
                      const rating = c.status !== "متوفر" ? 0 : avgSp >= 200 ? 5 : avgSp >= 100 ? 4 : avgSp >= 50 ? 3 : 2;
                      // Estimated delivery (business days) by country tier
                      const fastCountries = ["الأردن", "الإمارات", "السعودية", "قطر", "البحرين", "الكويت"];
                      const eta = c.status !== "متوفر"
                        ? "—"
                        : fastCountries.includes(c.country || "")
                          ? "2–4 أيام عمل"
                          : "5–7 أيام عمل";
                      return (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8, paddingTop: 6, borderTop: "1px solid #eee", fontSize: 11, color: "#555" }}>
                          <span title="وقت التوصيل التقديري">🚚 {eta}</span>
                          {rating > 0 && (
                            <span title={`${rating} / 5`} aria-label={`تقييم ${rating} من 5`}>
                              {"★".repeat(rating)}<span style={{ color: "#ddd" }}>{"★".repeat(5 - rating)}</span>
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    {c.services && c.services.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8, justifyContent: "flex-end" }}>
                        {c.services.map((sv) => {
                          const labels: Record<ServiceKey, string> = { residential: "منزلي", roam: "تجوال", business: "أعمال" };
                          const bg: Record<ServiceKey, string> = {
                            residential: hslToken("--service-residential"),
                            roam: hslToken("--service-roam"),
                            business: hslToken("--service-business"),
                          };
                          return (
                            <span
                              key={sv}
                              style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: bg[sv], color: "#fff", fontWeight: 500 }}
                            >
                              {labels[sv]}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <Link
                      to={`/checkout?plan=${service !== "all" ? service : (c.services?.[0] || "residential")}&address=${encodeURIComponent(c.name)}`}
                      style={{ display: "block", textAlign: "center", fontSize: 12, padding: "6px 12px", background: "#000", color: "#fff", textDecoration: "none", borderRadius: 2, fontWeight: 500 }}
                    >
                      اطلب الآن ›
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            </Fragment>
          );
        })}
      </MapContainer>

      {/* Floating Legend (top-start) */}
      <div
        className="absolute top-3 start-3 z-[400] bg-background/85 backdrop-blur-sm border border-foreground/15 shadow-lg p-3 text-xs max-w-[180px]"
        dir="rtl"
      >
        <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-2">
          الخدمات
        </div>
        <div className="space-y-1 mb-3">
          {(["all", "residential", "roam", "business"] as const).map((key) => {
            const active = service === key;
            const dot =
              key === "all"
                ? "hsl(var(--service-neutral))"
                : `hsl(var(${SERVICE_TOKEN[key as ServiceKey]}))`;
            const label = key === "all" ? "الكل" : SERVICE_LABEL[key as ServiceKey];
            const count = counts[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onServiceChange?.(key)}
                disabled={!onServiceChange}
                className={`w-full flex items-center justify-between gap-2 px-2 py-1 rounded-sm transition-colors ${
                  active
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5"
                } ${onServiceChange ? "cursor-pointer" : "cursor-default"}`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: dot }}
                  />
                  <span>{label}</span>
                </span>
                <span className="text-[10px] tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-2 pt-2 border-t border-foreground/10">
          الحالة
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2 px-2 py-0.5">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--service-residential))" }} />
              <span>متوفر</span>
            </span>
            <span className="text-[10px] tabular-nums opacity-70">{counts.available}</span>
          </div>
          <div className="flex items-center justify-between gap-2 px-2 py-0.5">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--status-soon))" }} />
              <span>قريباً</span>
            </span>
            <span className="text-[10px] tabular-nums opacity-70">{counts.soon}</span>
          </div>
          <div className="flex items-center justify-between gap-2 px-2 py-0.5">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(45, 90%, 55%)" }} />
              <span>سرعة عالية ⚡</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
