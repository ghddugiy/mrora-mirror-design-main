import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SITE_CONTENT, type SiteContent, validateContent } from "./site-content";

type SiteContentContextValue = {
  content: SiteContent;
  setContent: (next: SiteContent) => Promise<void>;
  resetContent: () => Promise<void>;
  refreshContent: () => Promise<void>;
  isContactOpen: boolean;
  setContactOpen: (open: boolean) => void;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

async function fetchContent(): Promise<SiteContent> {
  try {
    const res = await fetch("/api/content", { credentials: "include" });
    if (!res.ok) return DEFAULT_SITE_CONTENT;
    const data = await res.json();
    return validateContent(data) ? data : DEFAULT_SITE_CONTENT;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

async function postContent(path: string, body?: unknown) {
  const res = await fetch(path, {
    method: body ? "POST" : "POST",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (!res.ok) {
    const message = await res.text().catch(() => "Request failed");
    throw new Error(message || "Request failed");
  }
  return res;
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState(DEFAULT_SITE_CONTENT);
  const [isContactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    void fetchContent().then(setContentState);
    const onUpdate = () => void fetchContent().then(setContentState);
    window.addEventListener("mrora-content-updated", onUpdate);
    return () => window.removeEventListener("mrora-content-updated", onUpdate);
  }, []);

  const value = useMemo<SiteContentContextValue>(() => ({
    content,
    setContent: async (next) => {
      await postContent("/api/admin/content", next);
      setContentState(next);
      window.dispatchEvent(new Event("mrora-content-updated"));
    },
    resetContent: async () => {
      await postContent("/api/admin/content/reset");
      const fresh = await fetchContent();
      setContentState(fresh);
      window.dispatchEvent(new Event("mrora-content-updated"));
    },
    refreshContent: async () => {
      const fresh = await fetchContent();
      setContentState(fresh);
    },
    isContactOpen,
    setContactOpen,
  }), [content, isContactOpen]);


  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const value = useContext(SiteContentContext);
  if (!value) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return value;
}
