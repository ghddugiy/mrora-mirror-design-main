import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useSiteContent } from "@/lib/site-content-context";
import { parseAdjustments } from "@/lib/utils";

export function Testimonials() {
  const [i, setI] = useState(0);
  const { ref } = useInView<HTMLDivElement>(0.2);
  const { content } = useSiteContent();
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % content.testimonials.length), 5000);
    return () => clearInterval(id);
  }, [content.testimonials.length]);
  const t = content.testimonials[i];
  const adj = t ? parseAdjustments(t.avatar) : { fit: "cover" as const, x: 50, y: 50, zoom: 100 };
  return (
    <section className="bg-black py-32 px-6 border-t border-white/5">
      <div ref={ref} className="section-reveal mx-auto max-w-5xl text-center">
        <div className="text-[color:var(--lime)] text-sm tracking-widest mb-8">CLIENT LOVE</div>
        <blockquote
          key={i}
          className="text-display text-3xl md:text-5xl text-white leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          “{t.quote}”
        </blockquote>
        <div className="mt-10 flex items-center justify-center gap-4">
          <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-white/10">
            <img
              src={t.avatar}
              alt={t.name}
              className="h-full w-full"
              style={{
                objectFit: adj.fit,
                objectPosition: `${adj.x}% ${adj.y}%`,
                transform: adj.zoom !== 100 ? `scale(${adj.zoom / 100})` : undefined,
              }}
            />
          </div>
          <div className="text-left">
            <div className="text-white font-semibold">{t.name}</div>
            <div className="text-white/50 text-sm">{t.role}</div>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {content.testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              data-cursor="hover"
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-[color:var(--lime)]" : "w-3 bg-white/30"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
