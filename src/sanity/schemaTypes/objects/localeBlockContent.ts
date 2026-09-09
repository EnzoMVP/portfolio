import { defineType, defineField } from "sanity";

export const localeBlockContent = defineType({
  name: "localeBlockContent",
  title: "Localized rich text",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "ptBR", title: "Português (BR)", type: "array", of: [{ type: "block" }] }),
  ],
});
