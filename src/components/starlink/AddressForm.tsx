import { Crosshair } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";
import { useCountry } from "@/contexts/CountryContext";

interface AddressFormProps {
  variant?: "hero" | "inline";
  plan?: "residential" | "roam-local" | "roam-unlimited" | "roam-global";
}

const AddressForm = ({ variant = "hero", plan = "residential" }: AddressFormProps) => {
  const { t } = useTranslation();
  const { info } = useCountry();
  const [city, setCity] = useState<string>(info.cities[0] ?? "");
  const [street, setStreet] = useState("");
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

  // Reset selected city when country changes
  const cities = info.cities;
  if (city && !cities.includes(city)) {
    setCity(cities[0] ?? "");
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = street.trim();
    if (trimmed.length < 3) {
      toast({ title: t("address.errInvalidTitle"), description: t("address.errInvalidDesc"), variant: "destructive" });
      return;
    }
    const fullAddress = `${trimmed}, ${city}, ${info.nameAr}`;
    const params = new URLSearchParams({ plan, address: fullAddress.slice(0, 200), city, country: info.code });
    navigate(`/checkout?${params.toString()}`);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: t("address.geoUnsupportedTitle"), description: t("address.geoUnsupportedDesc"), variant: "destructive" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStreet(t("address.currentLocation", { lat: pos.coords.latitude.toFixed(3), lng: pos.coords.longitude.toFixed(3) }));
        setLocating(false);
        toast({ title: t("address.locatedTitle") });
      },
      () => {
        setLocating(false);
        toast({ title: t("address.geoErrorTitle"), description: t("address.geoErrorDesc"), variant: "destructive" });
      }
    );
  };

  return (
    <form onSubmit={onSubmit} className={variant === "hero" ? "max-w-2xl mx-auto" : "max-w-2xl mx-auto"}>
      <p className="text-sm md:text-base mb-3 text-foreground/90">
        {t("address.label")} — <span className="text-muted-foreground">{info.nameAr}</span>
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-label={t("address.cityLabel", { defaultValue: "المدينة" })}
          className="h-14 sm:w-44 bg-background/40 backdrop-blur-md border border-border rounded-sm px-4 text-foreground focus:outline-none focus:border-foreground/50 transition-colors text-sm"
        >
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            maxLength={200}
            placeholder={t("address.placeholder")}
            className="w-full h-14 bg-background/40 backdrop-blur-md border border-border rounded-sm px-4 pl-12 text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:border-foreground/50 transition-colors text-sm"
          />
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            aria-label={t("address.useLocationAria")}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <Crosshair className={`w-5 h-5 ${locating ? "animate-pulse" : ""}`} />
          </button>
        </div>
        <button type="submit" className="h-14 px-8 bg-background/40 backdrop-blur-md border border-foreground/80 text-foreground hover:bg-foreground hover:text-background transition-all text-sm font-medium tracking-wider whitespace-nowrap">
          {t("address.submit")}
        </button>
      </div>
      <a href="/map" className="inline-flex items-center gap-1 mt-4 text-sm text-foreground/90 hover:text-foreground transition-colors">
        <span>›</span> {t("address.viewMap")}
      </a>
    </form>
  );
};

export default AddressForm;
