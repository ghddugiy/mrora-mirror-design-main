import { createFileRoute } from "@tanstack/react-router";
import { Cursor } from "@/components/Cursor";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Vision } from "@/components/Vision";
import { Services } from "@/components/Services";
import { Team } from "@/components/Team";
import { Testimonials } from "@/components/Testimonials";
import { Projects } from "@/components/Projects";
import { Footer } from "@/components/Footer";
import { ContactDialog } from "@/components/ContactDialog";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Cursor />
      <Nav />
      <Hero />
      <About />
      <Vision />
      <Services />
      <Projects />
      <Team />
      <Testimonials />
      <Footer />
      <ContactDialog />
    </div>
  );
}
