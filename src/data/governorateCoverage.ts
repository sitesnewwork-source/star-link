// Coverage % per governorate (Arabic name → percentage 0-100)
// Used for choropleth shading on the map.
export interface GovernorateInfo {
  en: string;
  ar: string;
  coverage: number;
  country?: "JO" | "SY" | "IQ" | "LB";
}

export const GOVERNORATE_COVERAGE: GovernorateInfo[] = [
  // Jordan
  { en: "Amman",    ar: "عمّان",    coverage: 95, country: "JO" },
  { en: "Zarqa",    ar: "الزرقاء",  coverage: 88, country: "JO" },
  { en: "Irbid",    ar: "إربد",     coverage: 85, country: "JO" },
  { en: "Balqa",    ar: "البلقاء",  coverage: 78, country: "JO" },
  { en: "Madaba",   ar: "مادبا",    coverage: 72, country: "JO" },
  { en: "Mafraq",   ar: "المفرق",   coverage: 55, country: "JO" },
  { en: "Jerash",   ar: "جرش",      coverage: 70, country: "JO" },
  { en: "Ajloun",   ar: "عجلون",    coverage: 65, country: "JO" },
  { en: "Karak",    ar: "الكرك",    coverage: 60, country: "JO" },
  { en: "Tafilah",  ar: "الطفيلة",  coverage: 50, country: "JO" },
  { en: "Ma'an",    ar: "معان",     coverage: 45, country: "JO" },
  { en: "Aqaba",    ar: "العقبة",   coverage: 80, country: "JO" },

  // Syria
  { en: "Damascus",     ar: "دمشق",        coverage: 92, country: "SY" },
  { en: "Rif Dimashq",  ar: "ريف دمشق",    coverage: 70, country: "SY" },
  { en: "Aleppo",       ar: "حلب",         coverage: 78, country: "SY" },
  { en: "Homs",         ar: "حمص",         coverage: 50, country: "SY" },
  { en: "Hama",         ar: "حماة",        coverage: 48, country: "SY" },
  { en: "Latakia",      ar: "اللاذقية",    coverage: 65, country: "SY" },
  { en: "Tartus",       ar: "طرطوس",       coverage: 60, country: "SY" },
  { en: "Idlib",        ar: "إدلب",        coverage: 35, country: "SY" },
  { en: "Daraa",        ar: "درعا",        coverage: 45, country: "SY" },
  { en: "Sweida",       ar: "السويداء",    coverage: 50, country: "SY" },
  { en: "Quneitra",     ar: "القنيطرة",    coverage: 30, country: "SY" },
  { en: "Deir ez-Zor",  ar: "دير الزور",   coverage: 28, country: "SY" },
  { en: "Raqqa",        ar: "الرقة",       coverage: 25, country: "SY" },
  { en: "Hasakah",      ar: "الحسكة",      coverage: 32, country: "SY" },

  // Iraq
  { en: "Baghdad",              ar: "بغداد",        coverage: 90, country: "IQ" },
  { en: "Basra",                ar: "البصرة",       coverage: 85, country: "IQ" },
  { en: "Mosul (Nineveh)",      ar: "الموصل",       coverage: 55, country: "IQ" },
  { en: "Erbil",                ar: "أربيل",        coverage: 75, country: "IQ" },
  { en: "Sulaymaniyah",         ar: "السليمانية",   coverage: 70, country: "IQ" },
  { en: "Kirkuk",               ar: "كركوك",        coverage: 58, country: "IQ" },
  { en: "Najaf",                ar: "النجف",        coverage: 60, country: "IQ" },
  { en: "Karbala",              ar: "كربلاء",       coverage: 62, country: "IQ" },
  { en: "Babil",                ar: "بابل",         coverage: 55, country: "IQ" },
  { en: "Dhi Qar (Nasiriyah)",  ar: "الناصرية",     coverage: 50, country: "IQ" },
  { en: "Anbar (Ramadi)",       ar: "الرمادي",      coverage: 35, country: "IQ" },
  { en: "Diyala (Baquba)",      ar: "بعقوبة",       coverage: 45, country: "IQ" },
  { en: "Wasit (Kut)",          ar: "الكوت",        coverage: 48, country: "IQ" },
  { en: "Maysan (Amarah)",      ar: "العمارة",      coverage: 42, country: "IQ" },

  // Lebanon
  { en: "Beirut",          ar: "بيروت",          coverage: 95, country: "LB" },
  { en: "Mount Lebanon",   ar: "جبل لبنان",      coverage: 85, country: "LB" },
  { en: "North (Tripoli)", ar: "الشمال",         coverage: 86, country: "LB" },
  { en: "Akkar",           ar: "عكار",           coverage: 55, country: "LB" },
  { en: "South (Sidon)",   ar: "الجنوب",         coverage: 72, country: "LB" },
  { en: "Nabatieh",        ar: "النبطية",        coverage: 65, country: "LB" },
  { en: "Bekaa (Zahle)",   ar: "البقاع",         coverage: 60, country: "LB" },
  { en: "Baalbek-Hermel",  ar: "بعلبك-الهرمل",   coverage: 50, country: "LB" },
];

export const coverageByEn = (en: string): GovernorateInfo | undefined =>
  GOVERNORATE_COVERAGE.find((g) => g.en === en);

// Sequential green scale: low coverage → faint, high coverage → strong
export const coverageColor = (pct: number): string => {
  // HSL hue 142 (green), vary lightness based on coverage
  const lightness = 75 - (pct / 100) * 40; // 75% → 35%
  return `hsl(142, 65%, ${lightness}%)`;
};
