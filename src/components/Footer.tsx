import mroraLogo from "@/assets/mrora-logo.png";
import { useSiteContent } from "@/lib/site-content-context";

export function Footer() {
  const { content, setContactOpen } = useSiteContent();
  return (
    <footer id="contact" className="relative bg-black border-t border-white/10 pt-24 pb-10 px-6 overflow-hidden">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-7">
            <h3 className="text-display text-5xl md:text-7xl text-white leading-none">
              Let's build<br />something<br />
              <span className="text-[color:var(--lime)]">unforgettable.</span>
            </h3>
            <p className="mt-6 max-w-xl text-white/60">{content.footer.description}</p>
            <button onClick={() => setContactOpen(true)} className="pill mt-10 cursor-pointer">
              {content.contact.email} <span aria-hidden>-&gt;</span>
            </button>
          </div>
          <div className="col-span-6 md:col-span-2 text-sm text-white/60 space-y-2">
            <div className="text-white font-semibold mb-3">Studio</div>
            <a href="#projects" className="block hover:text-[color:var(--lime)]">Work</a>
            <a href="#about" className="block hover:text-[color:var(--lime)]">About</a>
            <a href="#team" className="block hover:text-[color:var(--lime)]">Team</a>
            <button onClick={() => setContactOpen(true)} className="block text-left hover:text-[color:var(--lime)] cursor-pointer">Contact</button>
          </div>
          <div className="col-span-6 md:col-span-3 text-sm text-white/60 space-y-2">
            <div className="text-white font-semibold mb-3">Elsewhere</div>
            <a href="#" className="block hover:text-[color:var(--lime)]">Instagram</a>
            <a href="#" className="block hover:text-[color:var(--lime)]">Behance</a>
            <a href="#" className="block hover:text-[color:var(--lime)]">Dribbble</a>
            <a href="#" className="block hover:text-[color:var(--lime)]">LinkedIn</a>
          </div>
        </div>
        <div className="mt-24 flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-xs border-t border-white/10 pt-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 p-0.5 border border-white/10 overflow-hidden">
              <img src={mroraLogo} alt="Mrora Logo" className="h-full w-full object-contain rounded-full" />
            </div>
            <span className="text-sm font-bold tracking-wider uppercase text-white/80">
              Mrora
            </span>
            <span className="text-white/40 ml-2">{content.footer.copyright}</span>
          </div>
          <div>{content.contact.address}</div>
        </div>
        <div aria-hidden className="text-ghost text-[24vw] leading-[0.8] mt-8 text-center pointer-events-none select-none">
          MRORA
        </div>
      </div>
    </footer>
  );
}

