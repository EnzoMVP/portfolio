import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "tagline", title: "Tagline", type: "localeString" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "linkedinUrl", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "githubUrl", title: "GitHub URL", type: "url" }),
    defineField({ name: "defaultOgImage", title: "Default OG image", type: "image" }),
  ],
  preview: {
    select: { title: "name" },
  },
});
