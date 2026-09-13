import type { IconType } from "react-icons";
import { FaDatabase } from "react-icons/fa6";
import {
  SiApacheairflow,
  SiApachespark,
  SiDatabricks,
  SiDocker,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiScikitlearn,
} from "react-icons/si";

// Free-text tech tags come from Sanity project documents, so this maps the
// tags actually used across projects to their official brand mark/color
// (same sourcing convention as SKILLS in skills-data.ts). Kept separate from
// that file since it's a different, unrelated UI (project tech badges vs.
// the curated Skills marquee) with its own tag vocabulary — e.g. "Apache
// Airflow" here vs. "Airflow" there.
const TECH_ICONS: Record<string, { Icon: IconType; color: string }> = {
  Python: { Icon: SiPython, color: "#3776AB" },
  SQL: { Icon: FaDatabase, color: "#4A90D9" },
  PostgreSQL: { Icon: SiPostgresql, color: "#4169E1" },
  Pandas: { Icon: SiPandas, color: "#150458" },
  "scikit-learn": { Icon: SiScikitlearn, color: "#F7931E" },
  Databricks: { Icon: SiDatabricks, color: "#FF3621" },
  PySpark: { Icon: SiApachespark, color: "#E25A1C" },
  Docker: { Icon: SiDocker, color: "#2496ED" },
  "Apache Airflow": { Icon: SiApacheairflow, color: "#017CEE" },
};

const TECH_ICONS_BY_KEY = Object.fromEntries(
  Object.entries(TECH_ICONS).map(([name, value]) => [normalize(name), value]),
);

function normalize(tag: string) {
  return tag.trim().toLowerCase();
}

const FALLBACK = { Icon: FaDatabase, color: "#979992" };

// Tags are free text typed into Sanity by a content editor, so a lookup that
// only matched the exact casing/spacing used here ("PostgreSQL" vs
// "postgresql") would silently fall back to a generic gray icon with no
// warning — normalizing both sides catches that without needing an editor
// to match this file's exact spelling.
export function getTechIcon(tag: string) {
  return TECH_ICONS_BY_KEY[normalize(tag)] ?? FALLBACK;
}
