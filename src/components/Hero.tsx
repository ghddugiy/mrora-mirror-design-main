import { Cube3D } from "./Cube3D";
import { useSiteContent } from "@/lib/site-content-context";

export function Hero() {
  const { content } = useSiteContent();
  return (
    <section className="relative overflow-hidden bg-black pt-32 pb-24">
      <h1
        aria-hidden
        className="pointer-events-none select-none absolute inset-x-0 top-16 text-center text-[24vw] font-black leading-none text-white/[0.085] [-webkit-text-stroke:1px_rgba(255,255,255,0.28)] [text-shadow:0_0_80px_rgba(198,255,61,0.12)]"
      >
        {content.hero.title}
      </h1>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        <div className="grid min-h-[560px] grid-cols-12 items-center gap-8 pt-8">
          <div className="col-span-12 self-center md:col-span-4 md:pr-8">
            <p className="max-w-md text-base leading-relaxed text-white/78 md:text-lg">
              {content.hero.description}
            </p>
          </div>

          <div className="col-span-12 flex justify-center md:col-span-5">
            <Cube3D />
          </div>

          <div className="col-span-12 self-center text-sm tracking-wide text-white/70 md:col-span-3 md:text-right">
            *ESTABLISHED - 2026
            <br />
            Bangalore, India
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <a href="#projects" className="pill">
            Our Projects
            <span aria-hidden>-&gt;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
