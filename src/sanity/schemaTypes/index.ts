import type { SchemaTypeDefinition } from "sanity";

import { localeString } from "./objects/localeString";
import { localeText } from "./objects/localeText";
import { localeBlockContent } from "./objects/localeBlockContent";
import { project } from "./project";
import { skill } from "./skill";
import { certification } from "./certification";
import { siteSettings } from "./siteSettings";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    localeString,
    localeText,
    localeBlockContent,
    project,
    skill,
    certification,
    siteSettings,
  ],
};
