import { RevealHeading } from "./RevealHeading";
import { useInView } from "@/hooks/useInView";
import { useSiteContent } from "@/lib/site-content-context";

export function About() {
  const { ref } = useInView<HTMLDivElement>(0.15);
  const { content } = useSiteContent();

  return (
    <section id="about" className="relative bg-black py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-[1400px]">
        <RevealHeading
          text="ABOUT*US"
          className="text-[18vw] md:text-[14vw] text-white leading-none"
        />
        <div ref={ref} className="section-reveal mt-24 max-w-4xl">
          <h2 className="text-display text-4xl md:text-6xl text-white">
            {content.about.title}
          </h2>
          <div className="mt-8 space-y-6 text-lg md:text-2xl leading-relaxed text-white/70">
            {content.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
