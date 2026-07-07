import p1 from "@/assets/project-1.jpg";
import p2 from "@/assets/project-2.jpg";
import p3 from "@/assets/project-3.jpg";
import t1 from "@/assets/team-1.jpg";
import t2 from "@/assets/team-2.jpg";
import t3 from "@/assets/team-3.jpg";
import t4 from "@/assets/team-4.jpg";
import t5 from "@/assets/team-5.jpg";
import t6 from "@/assets/team-6.jpg";
import a1 from "@/assets/avatar-1.jpg";
import a2 from "@/assets/avatar-2.jpg";
import a3 from "@/assets/avatar-3.jpg";
import { z } from "zod";

export type SiteContent = {
  hero: { title: string; description: string; image: string };
  about: { eyebrow: string; title: string; paragraphs: string[] };
  vision: { eyebrow: string; title: string; description: string };
  services: Array<{ n: string; title: string; desc: string; label: string; tags: string[] }>;
  projects: Array<{ title: string; tag: string; image: string; href: string }>;
  testimonials: Array<{ name: string; role: string; quote: string; avatar: string }>;
  team: Array<{ name: string; role: string; image: string; portfolioUrl: string }>;
  faqs: Array<{ question: string; answer: string }>;
  contact: { email: string; phone: string; address: string; ctaLabel: string };
  footer: { description: string; copyright: string };
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    title: "MRORA",
    description:
      "At Mrora, we don't just build websites, we create digital experiences that help businesses grow, build trust, and convert visitors into customers. From strategy and branding to high-performance web development and SEO, we become the digital partner your business has been missing.",
    image: p1,
  },
  about: {
    eyebrow: "ABOUT*US",
    title: "We Build More Than Websites",
    paragraphs: [
      "A website is often the first impression your business makes. We ensure it's the right one.",
      "Mrora combines creativity, technology, and business strategy to build websites that are visually compelling, technically robust, SEO-optimized, and designed to generate measurable results.",
      "Whether you're a startup establishing your online presence or an established business looking to scale, we deliver solutions tailored to your goals.",
    ],
  },
  vision: {
    eyebrow: "Your Vision, Our Expertise",
    title: "Partner with us to bring your ideas to life with precision and creativity.",
    description:
      "From the first sketch to the final pixel, Mrora treats every project as a chance to design something people remember. Strategy, craft, and motion, engineered as one.",
  },
  services: [
    {
      n: "01",
      title: "Web Design & Development",
      desc: "Beautiful, responsive, and scalable websites built using modern technologies. Every website is customized to reflect your brand while delivering an exceptional user experience.",
      label: "What we deliver",
      tags: ["Responsive Design", "Custom Development", "Landing Pages", "Business Websites", "E-commerce Websites", "CMS Integration", "Performance Optimization"],
    },
    {
      n: "02",
      title: "SEO Optimization",
      desc: "Your website deserves to be found. We implement technical SEO, keyword strategy, on-page optimization, and performance improvements that increase your visibility in search results and drive qualified traffic.",
      label: "Includes",
      tags: ["Keyword Research", "Technical SEO", "On-Page SEO", "Site Speed Optimization", "Meta Optimization", "Local SEO", "Analytics & Reporting"],
    },
    {
      n: "03",
      title: "UX/UI Design",
      desc: "Great design isn't just beautiful, it's intuitive. We create user-centered experiences that guide visitors naturally, improve engagement, and increase conversions.",
      label: "Services",
      tags: ["User Research", "Wireframing", "Interactive Prototypes", "User Interface Design", "Mobile-First Design", "Design Systems"],
    },
    {
      n: "04",
      title: "Branding",
      desc: "Your brand is more than a logo, it's how people remember you. We help businesses establish a consistent visual identity and messaging that builds recognition and trust.",
      label: "Branding Includes",
      tags: ["Logo Design", "Brand Identity", "Color & Typography", "Brand Guidelines", "Marketing Assets", "Social Media Branding"],
    },
  ],
  projects: [
    { title: "Innovate Electronics", tag: "Web Design & Development", image: p1, href: "https://innovate-electronics-ffhhzyxpna-el.a.run.app/" },
    { title: "DMAT", tag: "Product & UX", image: p2, href: "https://dmatt-m6ltwsqb5-accc2.vercel.app/login" },
    { title: "RJ Associates", tag: "Business Website", image: p3, href: "https://haven-craft-ui-main.vercel.app/" },
  ],
  testimonials: [
    { name: "Clara Weiss", role: "CMO, Northline", quote: "Mrora rebuilt our brand and site in eight weeks. Traffic doubled and, more importantly, it finally looks like us.", avatar: a1 },
    { name: "Daniel Ito", role: "Founder, Kobo Studio", quote: "The most detail-obsessed team we've worked with. Every interaction has a reason and it shows.", avatar: a2 },
    { name: "Priya Nair", role: "Head of Product, Vellum", quote: "They shipped a design system our whole product org still uses two years later. Unreal craftsmanship.", avatar: a3 },
  ],
  team: [
    { name: "Andrei Popescu", role: "Creative Director", image: t1, portfolioUrl: "https://example.com" },
    { name: "Ioana Radu", role: "Design Lead", image: t2, portfolioUrl: "https://example.com" },
    { name: "Mihai Stan", role: "Motion Designer", image: t3, portfolioUrl: "https://example.com" },
    { name: "Elena Marin", role: "Brand Strategist", image: t4, portfolioUrl: "https://example.com" },
    { name: "Vlad Ionescu", role: "Front-end Engineer", image: t5, portfolioUrl: "https://example.com" },
    { name: "Sara Dumitru", role: "Producer", image: t6, portfolioUrl: "https://example.com" },
  ],
  faqs: [
    { question: "What does the process look like?", answer: "We start with strategy, move into design, then build and refine until launch." },
    { question: "Do you provide ongoing support?", answer: "Yes. We can continue with content updates, performance checks, and feature work." },
  ],
  contact: {
    email: typeof process !== "undefined" && process.env?.CONTACT_EMAIL || "mroraai11@gmail.com",
    phone: "+91 9980866080",
    address: "Bangalore, India",
    ctaLabel: "Let's Talk",
  },
  footer: {
    description: "A design and digital studio focused on memorable, measurable web experiences.",
    copyright: "© Mrora Studio. All rights reserved.",
  },
};

const imageUrlSchema = z.string().min(1).max(512);
const linkSchema = z.string().url().max(512);

export const siteContentSchema = z.object({
  hero: z.object({
    title: z.string().min(1).max(80),
    description: z.string().min(1).max(500),
    image: imageUrlSchema,
  }),
  about: z.object({
    eyebrow: z.string().min(1).max(80),
    title: z.string().min(1).max(120),
    paragraphs: z.array(z.string().min(1).max(500)).min(1).max(6),
  }),
  vision: z.object({
    eyebrow: z.string().min(1).max(80),
    title: z.string().min(1).max(160),
    description: z.string().min(1).max(500),
  }),
  services: z.array(z.object({
    n: z.string().min(1).max(8),
    title: z.string().min(1).max(120),
    desc: z.string().min(1).max(500),
    label: z.string().min(1).max(80),
    tags: z.array(z.string().min(1).max(80)).min(1).max(12),
  })).min(1).max(12),
  projects: z.array(z.object({
    title: z.string().min(1).max(120),
    tag: z.string().min(1).max(80),
    image: imageUrlSchema,
    href: linkSchema,
  })).min(1).max(12),
  testimonials: z.array(z.object({
    name: z.string().min(1).max(120),
    role: z.string().min(1).max(120),
    quote: z.string().min(1).max(500),
    avatar: imageUrlSchema,
  })).min(1).max(12),
  team: z.array(z.object({
    name: z.string().min(1).max(120),
    role: z.string().min(1).max(120),
    image: imageUrlSchema,
    portfolioUrl: linkSchema,
  })).min(1).max(12),
  faqs: z.array(z.object({
    question: z.string().min(1).max(180),
    answer: z.string().min(1).max(500),
  })).min(0).max(20),
  contact: z.object({
    email: z.string().email().max(180),
    phone: z.string().min(1).max(60),
    address: z.string().min(1).max(180),
    ctaLabel: z.string().min(1).max(60),
  }),
  footer: z.object({
    description: z.string().min(1).max(300),
    copyright: z.string().min(1).max(120),
  }),
});

export function validateContent(value: unknown): value is SiteContent {
  return siteContentSchema.safeParse(value).success;
}
