import { TagMarquee } from "./TopMarquee";
import { useInView } from "@/hooks/useInView";
import { useSiteContent } from "@/lib/site-content-context";

export function Vision() {
  const { ref } = useInView<HTMLDivElement>(0.3);
  const { content } = useSiteContent();

  return (
    <section className="relative bg-black py-32 overflow-hidden border-t border-white/5">
      <div ref={ref} className="section-reveal mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 md:col-span-3 text-[color:var(--lime)] text-sm tracking-wider">
            {content.vision.eyebrow}
          </div>
          <div className="col-span-12 md:col-span-6">
            <h2 className="text-display text-4xl md:text-6xl text-white leading-tight">
              {content.vision.title}
            </h2>
            <p className="mt-6 text-white/60 max-w-xl">
              {content.vision.description}
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 md:text-right">
            <div className="text-white/10 text-[9rem] md:text-[11rem] font-bold leading-none">02</div>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <TagMarquee />
      </div>
    </section>
  );
}
