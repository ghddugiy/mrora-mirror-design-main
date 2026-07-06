const SERVICES = [
  "E-commerce Solutions",
  "Mobile App Design",
  "Digital Marketing",
  "Graphic Design",
  "Content Creation",
  "Social Media Management",
  "Video Production",
  "Consulting Services",
  "Web Design",
  "Branding",
];

export function TopMarquee() {
  const track = [...SERVICES, ...SERVICES];
  return (
    <div className="border-y border-white/10 bg-black overflow-hidden py-4">
      <div className="marquee-track gap-10 whitespace-nowrap text-sm md:text-base">
        {track.map((s, i) => (
          <span key={i} className="flex items-center gap-10 text-white/85">
            <span>{s}</span>
            <span className="text-[color:var(--lime)] text-lg">✚</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function TagMarquee() {
  const tags = ["Web Design", "SEO", "UI / UX", "Branding", "Development", "Strategy", "Motion", "Content", "3D", "Illustration"];
  const track = [...tags, ...tags, ...tags];
  return (
    <div className="overflow-hidden py-6">
      <div className="marquee-track-reverse gap-6 whitespace-nowrap">
        {track.map((t, i) => (
          <span key={i} className="flex items-center gap-6">
            <span className="text-white/70 text-xl md:text-2xl">{t}</span>
            <span className="text-[color:var(--lime)]">✚</span>
          </span>
        ))}
      </div>
    </div>
  );
}
