import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ImageAdjustments {
  fit: "cover" | "contain";
  x: number;
  y: number;
  zoom: number;
}

export function parseAdjustments(urlStr: string): ImageAdjustments {
  if (!urlStr) return { fit: "cover", x: 50, y: 50, zoom: 100 };
  try {
    const url = new URL(urlStr, window.location.origin);
    const fit = (url.searchParams.get("fit") as "cover" | "contain") || "cover";
    const x = parseInt(url.searchParams.get("x") || "50", 10);
    const y = parseInt(url.searchParams.get("y") || "50", 10);
    const zoom = parseInt(url.searchParams.get("zoom") || "100", 10);
    return { fit, x, y, zoom };
  } catch {
    // If it has search params query string but not parseable as full URL
    if (urlStr.includes("?")) {
      try {
        const params = new URLSearchParams(urlStr.split("?")[1]);
        const fit = (params.get("fit") as "cover" | "contain") || "cover";
        const x = parseInt(params.get("x") || "50", 10);
        const y = parseInt(params.get("y") || "50", 10);
        const zoom = parseInt(params.get("zoom") || "100", 10);
        return { fit, x, y, zoom };
      } catch {
        // Fall through
      }
    }
    return { fit: "cover", x: 50, y: 50, zoom: 100 };
  }
}

export function updateAdjustments(urlStr: string, adj: Partial<ImageAdjustments>): string {
  if (!urlStr) urlStr = "";
  const baseUrl = urlStr.split("?")[0];
  const current = parseAdjustments(urlStr);
  const next = { ...current, ...adj };
  const params = new URLSearchParams();
  params.set("fit", next.fit);
  params.set("x", String(next.x));
  params.set("y", String(next.y));
  params.set("zoom", String(next.zoom));
  return `${baseUrl}?${params.toString()}`;
}

