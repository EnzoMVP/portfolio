import { defineType, defineField } from "sanity";

export const localeText = defineType({
  name: "localeText",
  title: "Localized text",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "text", rows: 3 }),
    defineField({ name: "ptBR", title: "Português (BR)", type: "text", rows: 3 }),
  ],
});
