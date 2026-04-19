import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import streaming from "@/assets/streaming.jpg";
import workHome from "@/assets/work-home.jpg";
import gaming from "@/assets/gaming.jpg";
import videoCall from "@/assets/video-call.jpg";

const UseCasesCarousel = () => {
  const { t } = useTranslation();
  const slides = [
    { title: t("residential.useCases.streamTitle"), body: t("residential.useCases.streamBody"), image: streaming },
    { title: t("residential.useCases.workTitle"), body: t("residential.useCases.workBody"), image: workHome },
    { title: t("residential.useCases.gameTitle"), body: t("residential.useCases.gameBody"), image: gaming },
    { title: t("residential.useCases.videoTitle"), body: t("residential.useCases.videoBody"), image: videoCall },
  ];
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);
  const slide = slides[idx];

  return (
    <section className="relative py-20 md:py-32 section-gradient">
      <div className="container">
        <div className="relative grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
          <div className="relative aspect-[4/3] overflow-hidden order-2 md:order-1">
            <img
              src={slide.image}
              alt={slide.title}
              loading="lazy"
              className="w-full h-full object-cover transition-opacity duration-500"
              key={slide.image}
            />
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 leading-tight">{slide.title}</h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{slide.body}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10">
          <button onClick={prev} aria-label={t("residential.useCases.prev")} className="p-2 text-foreground/70 hover:text-foreground transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`${t("residential.useCases.goto")} ${i + 1}`}
                className={`h-1 transition-all ${i === idx ? "w-8 bg-foreground" : "w-4 bg-foreground/30"}`}
              />
            ))}
          </div>
          <button onClick={next} aria-label={t("residential.useCases.next")} className="p-2 text-foreground/70 hover:text-foreground transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default UseCasesCarousel;
