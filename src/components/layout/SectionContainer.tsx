import type { ReactNode } from "react";

export function SectionContainer({
  id,
  label,
  heading,
  children,
  tone = "default",
}: {
  id: string;
  label?: string;
  heading?: string;
  children: ReactNode;
  tone?: "default" | "inverse";
}) {
  return (
    <section
      id={id}
      className={
        tone === "inverse"
          ? "bg-bg-inverse text-fg-inverse"
          : "bg-bg text-fg"
      }
    >
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        {label && (
          <p className="mb-3 font-mono text-xs tracking-widest text-fg-muted uppercase">
            {label}
          </p>
        )}
        {heading && (
          <h2 className="mb-10 font-display text-2xl font-bold tracking-tight uppercase sm:text-3xl">
            {heading}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
