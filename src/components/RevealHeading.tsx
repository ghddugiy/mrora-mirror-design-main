import { useInView } from "@/hooks/useInView";
import type { ReactNode } from "react";

interface Props {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  children?: ReactNode;
}

export function RevealHeading({ text, className = "", as = "h2" }: Props) {
  const { ref } = useInView<HTMLHeadingElement>(0.2);
  const Tag = as as "h2";
  return (
    <Tag
      ref={ref as any}
      className={`text-display ${className}`}
      aria-label={text}
    >
      {text.split("").map((c, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-baseline"
          style={{ lineHeight: 0.9 }}
        >
          <span
            className="reveal-char"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {c === " " ? "\u00A0" : c}
          </span>
        </span>
      ))}
    </Tag>
  );
}