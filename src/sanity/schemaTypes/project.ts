import { defineType, defineField } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.en" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "summary", title: "Summary (card blurb)", type: "localeText" }),
    defineField({
      name: "description",
      title: "Full description (detail page)",
      type: "localeBlockContent",
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "localeString" }],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image" }],
    }),
    defineField({ name: "repoUrl", title: "Repository URL", type: "url" }),
    defineField({ name: "liveUrl", title: "Live URL", type: "url" }),
    defineField({
      name: "techTags",
      title: "Tech tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({ name: "role", title: "Role", type: "localeString" }),
    defineField({ name: "startDate", title: "Start date", type: "date" }),
    defineField({ name: "endDate", title: "End date (empty = ongoing)", type: "date" }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Display order", type: "number" }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title.en", media: "coverImage" },
  },
});
