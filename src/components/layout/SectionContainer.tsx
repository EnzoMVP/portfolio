import type { ReactNode } from "react";

export function SectionContainer({
  id,
  heading,
  children,
  tone = "default",
}: {
  id: string;
  heading?: string;
  children: ReactNode;
  tone?: "default" | "inverse";
}) {
  return (
    <section
      id={id}
      className={
        tone === "inverse"
          ? "[overflow-x:clip] bg-bg-inverse text-fg-inverse"
          : "[overflow-x:clip] bg-bg text-fg"
      }
    >
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
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
