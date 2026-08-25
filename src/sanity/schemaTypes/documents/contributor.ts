import { defineField, defineType } from "sanity";
import { ContributorDocumentInput } from "../../components/IncomingReferencesPanel";

export const contributor = defineType({
  name: "contributor",
  title: "Contributor",
  type: "document",
  components: { input: ContributorDocumentInput },
  initialValue: { active: true },
  fields: [
    defineField({ name: "name", title: "Name", type: "string", description: "The public byline name.", validation: (Rule) => Rule.required().min(1).max(100) }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name", maxLength: 100 }, description: "Generate this before publishing. It controls the contributor profile URL.", validation: (Rule) => Rule.required() }),
    defineField({ name: "graduationYear", title: "Graduation year", type: "number", description: "Optional. Add only when approved for public display.", validation: (Rule) => Rule.integer().min(2000).max(2200) }),
    defineField({ name: "active", title: "Available for new articles", type: "boolean", initialValue: true, description: "Archive a contributor instead of deleting them when they leave the publication." }),
    defineField({ name: "migrationSourceId", title: "Migration source ID", type: "string", readOnly: true, hidden: ({ value }) => !value }),
    defineField({ name: "importBatchId", title: "Import batch ID", type: "string", readOnly: true, hidden: ({ value }) => !value }),
  ],
  preview: { select: { title: "name", graduationYear: "graduationYear", active: "active" }, prepare: ({ title, graduationYear, active }) => ({ title, subtitle: [typeof graduationYear === "number" ? `Class of ${graduationYear}` : undefined, active === false ? "Archived" : undefined].filter(Boolean).join(" · ") }) },
  orderings: [{ title: "Name", name: "name", by: [{ field: "name", direction: "asc" }] }],
});
