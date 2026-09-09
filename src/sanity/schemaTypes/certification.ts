import { defineType, defineField } from "sanity";

export const certification = defineType({
  name: "certification",
  title: "Certification",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "localeString" }),
    defineField({ name: "issuer", title: "Issuer", type: "string" }),
    defineField({ name: "issueDate", title: "Issue date", type: "date" }),
    defineField({ name: "expiryDate", title: "Expiry date", type: "date" }),
    defineField({ name: "credentialUrl", title: "Credential URL", type: "url" }),
    defineField({ name: "badgeImage", title: "Badge image", type: "image" }),
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
    select: { title: "name.en", subtitle: "issuer", media: "badgeImage" },
  },
});
