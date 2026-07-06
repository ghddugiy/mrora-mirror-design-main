import { useInView } from "@/hooks/useInView";
import { useSiteContent } from "@/lib/site-content-context";
import { parseAdjustments } from "@/lib/utils";

export function Projects() {
  const { ref } = useInView<HTMLDivElement>(0.1);
  const { content } = useSiteContent();
  return (
    <section id="projects" className="bg-black py-32 px-6 border-t border-white/5">
      <div ref={ref} className="section-reveal mx-auto max-w-[1400px]">
        <div className="mb-16 flex items-end justify-between">
          <h2 className="text-display text-5xl text-white md:text-7xl">
            Selected <span className="text-[color:var(--lime)]">Work</span>
          </h2>
          <div className="hidden text-sm text-white/50 md:block">/ 2023 - 2026</div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {content.projects.map((p) => {
            const adj = parseAdjustments(p.image);
            return (
              <a
                key={p.title}
                href={p.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="hover"
                className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-neutral-900 md:aspect-[3/4]"
              >
                <div className="h-full w-full overflow-hidden transition-transform duration-700 group-hover:scale-105">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full grayscale group-hover:grayscale-0 transition-all duration-700"
                    style={{
                      objectFit: adj.fit,
                      objectPosition: `${adj.x}% ${adj.y}%`,
                      transform: adj.zoom !== 100 ? `scale(${adj.zoom / 100})` : undefined,
                    }}
                  />
                </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-80 transition group-hover:opacity-100" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-2xl font-semibold text-white md:text-3xl">{p.title}</div>
                  <div className="text-sm text-[color:var(--lime)]">{p.tag}</div>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--lime)] text-black transition-transform md:translate-x-2 md:group-hover:translate-x-0">
                  -&gt;
                </span>
              </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
