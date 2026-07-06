import { useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useSiteContent } from "@/lib/site-content-context";

export function Services() {
  const [open, setOpen] = useState(0);
  const { ref } = useInView<HTMLDivElement>(0.15);
  const { content } = useSiteContent();
  return (
    <section id="services" className="bg-black py-32 border-t border-white/5">
      <div ref={ref} className="section-reveal mx-auto max-w-[1400px] px-6">
        <div className="flex items-end justify-between mb-16">
          <h2 className="text-display text-5xl md:text-7xl text-white">
            What we <span className="text-[color:var(--lime)]">do</span>
          </h2>
          <div className="text-white/50 text-sm hidden md:block">/ Services</div>
        </div>
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {content.services.map((r, i) => (
            <li key={r.n}>
              <button
                data-cursor="hover"
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center gap-6 py-8 text-left group"
              >
                <span className="text-white/40 text-lg w-14">{r.n}</span>
                <span className="text-3xl md:text-5xl text-display text-white group-hover:text-[color:var(--lime)] transition-colors flex-1">
                  {r.title}
                </span>
                <span className="text-[color:var(--lime)] text-2xl">
                  {open === i ? "-" : "+"}
                </span>
              </button>
              <div
                className="grid transition-all duration-500"
                style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="pb-8 pl-20 flex flex-col md:flex-row gap-6 md:gap-16">
                    <p className="text-white/70 max-w-lg leading-relaxed">{r.desc}</p>
                    <div>
                      <div className="mb-3 text-sm uppercase tracking-[0.2em] text-[color:var(--lime)]">
                        {r.label}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {r.tags.map((t) => (
                          <span key={t} className="px-3 py-1 border border-white/20 rounded-full text-xs text-white/70">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
