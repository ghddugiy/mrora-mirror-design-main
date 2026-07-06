import { RevealHeading } from "./RevealHeading";
import { useInView } from "@/hooks/useInView";
import { useSiteContent } from "@/lib/site-content-context";
import { parseAdjustments } from "@/lib/utils";

export function Team() {
  const { ref } = useInView<HTMLDivElement>(0.1);
  const { content } = useSiteContent();
  return (
    <section id="team" className="bg-black py-32 px-6 border-t border-white/5">
      <div ref={ref} className="section-reveal mx-auto max-w-[1400px]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <RevealHeading text="OUR*TEAM" className="text-[14vw] md:text-[10vw] text-white leading-none" />
          <p className="text-white/60 max-w-sm">
            A small studio of designers, engineers and strategists - obsessed with details others overlook.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
          {content.team.map((p, i) => {
            const adj = parseAdjustments(p.image);
            return (
              <a
                key={i}
                href={p.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className={`group ${i % 2 === 0 ? "tilt-l" : "tilt-r"}`}
                data-cursor="hover"
              >
                <div className="relative overflow-hidden rounded-lg bg-neutral-900 aspect-[4/5]">
                  <div className="h-full w-full overflow-hidden transition-transform duration-700 group-hover:scale-105">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full grayscale group-hover:grayscale-0 transition-all duration-700"
                      style={{
                        objectFit: adj.fit,
                        objectPosition: `${adj.x}% ${adj.y}%`,
                        transform: adj.zoom !== 100 ? `scale(${adj.zoom / 100})` : undefined,
                      }}
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                    <div className="text-white font-semibold">{p.name}</div>
                    <div className="text-[color:var(--lime)] text-sm">{p.role}</div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
