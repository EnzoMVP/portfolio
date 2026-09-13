import { getTechIcon } from "@/lib/project-tech-icons";

export function ProjectTechBadge({ tag }: { tag: string }) {
  const { Icon, color } = getTechIcon(tag);

  return (
    <span className="flex items-center gap-2 rounded-full border border-fg-inverse/15 bg-fg-inverse/5 py-2 pr-4 pl-3 text-sm font-semibold text-fg-inverse">
      <Icon size={16} color={color} />
      {tag}
    </span>
  );
}
