import { useInView } from "@/hooks/useInView";

const ROWS = [
  { year: "2025", title: "Awwwards — Site of the Day", cat: "Web Design" },
  { year: "2025", title: "CSS Design Awards — UI/UX", cat: "Interaction" },
  { year: "2024", title: "FWA of the Day", cat: "Motion" },
  { year: "2024", title: "Communication Arts — Typography", cat: "Branding" },
  { year: "2023", title: "European Design Awards — Silver", cat: "Identity" },
];

export function Awards() {
  const { ref } = useInView<HTMLDivElement>(0.15);
  return (
    <section id="awards" className="bg-black py-32 px-6 border-t border-white/5">
      <div ref={ref} className="section-reveal mx-auto max-w-[1400px]">
        <div className="flex items-end justify-between mb-16">
          <h2 className="text-display text-5xl md:text-7xl text-white">
            Recognition
          </h2>
          <div className="text-white/50 text-sm hidden md:block">/ Awards</div>
        </div>
        <ul className="border-t border-white/10">
          {ROWS.map((r, i) => (
            <li
              key={i}
              className="group grid grid-cols-12 items-center gap-4 py-6 border-b border-white/10 hover:bg-white/[0.02] transition-colors px-2"
              data-cursor="hover"
            >
              <span className="col-span-2 text-white/50">{r.year}</span>
              <span className="col-span-7 md:col-span-8 text-xl md:text-2xl text-white group-hover:text-[color:var(--lime)] transition-colors">
                {r.title}
              </span>
              <span className="col-span-3 md:col-span-2 text-right text-white/50 text-sm">{r.cat}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}