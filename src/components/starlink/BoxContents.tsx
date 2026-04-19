import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import kit from "@/assets/starlink-kit.jpg";

const BoxContents = () => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const items = [
    { name: t("residential.box.items.starlink"), img: kit },
    { name: t("residential.box.items.mount"), img: kit },
    { name: t("residential.box.items.router"), img: kit },
    { name: t("residential.box.items.cable"), img: kit },
    { name: t("residential.box.items.power"), img: kit },
    { name: t("residential.box.items.adapter"), img: kit },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-background border-t border-border">
      <div className="container">
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-5xl font-light mb-6 leading-tight">{t("residential.box.title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {t("residential.box.desc")}
          </p>
          <button className="h-11 px-6 border border-foreground/60 text-foreground hover:bg-foreground hover:text-background transition-all text-xs tracking-widest">
            {t("residential.box.specs")}
          </button>
        </div>

        <div className="relative">
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
            {items.map((item) => (
              <div key={item.name} className="flex-none w-64 md:w-72 snap-start">
                <div className="aspect-square bg-card border border-border overflow-hidden mb-3">
                  <img src={item.img} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-foreground/90 text-center">{item.name}</p>
              </div>
            ))}
          </div>
          <button onClick={() => scroll("right")} aria-label={t("residential.box.prev")} className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => scroll("left")} aria-label={t("residential.box.next")} className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BoxContents;
