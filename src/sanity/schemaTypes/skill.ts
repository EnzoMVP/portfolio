import { defineType, defineField } from "sanity";

export const skill = defineType({
  name: "skill",
  title: "Skill",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["languages", "ml-ai", "data", "tools", "other"],
      },
    }),
    defineField({
      name: "level",
      title: "Level",
      type: "string",
      options: { list: ["Familiar", "Proficient", "Advanced"] },
    }),
    defineField({ name: "icon", title: "Icon", type: "image" }),
    defineField({ name: "order", title: "Display order", type: "number" }),
  ],
  preview: {
    select: { title: "name", subtitle: "category" },
  },
});
