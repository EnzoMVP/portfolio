import type { IconType } from "react-icons";
import { FaDatabase } from "react-icons/fa6";
import {
  SiApacheairflow,
  SiApachespark,
  SiClaude,
  SiDatabricks,
  SiDocker,
  SiPandas,
  SiPython,
  SiScikitlearn,
  SiTensorflow,
} from "react-icons/si";

// Named SkillItem (not Skill) so it isn't confused with the unrelated
// `Skill` type in `@/lib/sanity/queries` — see the note on SKILLS below for
// why this list doesn't come from Sanity.
export type SkillItem = { name: string; Icon: IconType; color: string };

// Names/icons are proper nouns and brand marks — not localized, same as
// Skill.name/Certification.issuer elsewhere. Colors are each brand's
// official mark color (looked up via the simple-icons package, not a
// runtime dependency of this file) so the badges read as the real logos,
// not a reinterpreted palette. SQL has no single official brand logo, so it
// uses a generic database icon/color instead of a Simple Icons mark for a
// specific vendor the user didn't name.
//
// This list is hardcoded rather than pulled from Sanity's `skill` schema/
// `getSkills()` — a deliberate, user-requested exception to this repo's
// usual "content comes from /studio" rule for the marquee's specific,
// curated set of logo badges. `getSkills()` is unused as a result; it's
// left in place in case Skills content moves back to the CMS later.
export const SKILLS: SkillItem[] = [
  { name: "Python", Icon: SiPython, color: "#3776AB" },
  { name: "SQL", Icon: FaDatabase, color: "#4A90D9" },
  { name: "Pandas", Icon: SiPandas, color: "#150458" },
  { name: "scikit-learn", Icon: SiScikitlearn, color: "#F7931E" },
  { name: "Databricks", Icon: SiDatabricks, color: "#FF3621" },
  { name: "TensorFlow", Icon: SiTensorflow, color: "#FF6F00" },
  { name: "PySpark", Icon: SiApachespark, color: "#E25A1C" },
  { name: "Docker", Icon: SiDocker, color: "#2496ED" },
  { name: "Airflow", Icon: SiApacheairflow, color: "#017CEE" },
  { name: "Claude Code", Icon: SiClaude, color: "#D97757" },
];
