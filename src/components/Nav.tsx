import mroraLogo from "@/assets/mrora-logo.png";
import { useSiteContent } from "@/lib/site-content-context";

export function Nav() {
  const { setContactOpen } = useSiteContent();

  return (
    <header className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
      <a
        href="#"
        className="pointer-events-auto flex items-center gap-4 rounded-full bg-black/80 backdrop-blur border border-[color:var(--lime)]/20 px-6 py-2.5 text-base text-white/95 hover:border-[color:var(--lime)]/50 hover:shadow-[0_0_15px_rgba(198,255,61,0.2)] transition-all duration-300"
      >
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 p-1 border border-white/10 overflow-hidden">
          <img src={mroraLogo} alt="Mrora Logo" className="h-full w-full object-contain rounded-full" />
        </div>
        <span className="text-xl font-extrabold tracking-widest uppercase text-white hover:text-[color:var(--lime)] transition-colors">
          Mrora
        </span>
      </a>
      <nav className="pointer-events-auto hidden md:flex items-center gap-1 rounded-full bg-black/80 backdrop-blur border border-white/10 px-2 py-2 text-sm">
        {[
          ["Work", "projects"],
          ["About", "about"],
          ["Team", "team"],
        ].map(([label, href]) => (
          <a key={href} href={`#${href}`} className="px-4 py-1.5 rounded-full text-white/80 hover:text-black hover:bg-[color:var(--lime)] transition-colors">
            {label}
          </a>
        ))}
        <button
          onClick={() => setContactOpen(true)}
          className="px-4 py-1.5 rounded-full text-white/80 hover:text-black hover:bg-[color:var(--lime)] transition-colors cursor-pointer"
        >
          Contact
        </button>
      </nav>
      <button
        onClick={() => setContactOpen(true)}
        className="pointer-events-auto pill text-sm cursor-pointer"
      >
        Let's Talk
        <span aria-hidden>→</span>
      </button>
    </header>
  );
}
