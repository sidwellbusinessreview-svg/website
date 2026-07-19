import { defineArrayMember, defineField, defineType } from "sanity";
import { AboutStaffArrayInput } from "../../components/ContributorSelectors";

const permittedPageSlugs = ["about"];
type StaffEntryValue = { contributor?: { _ref?: string } };
export function validateUniqueStaff(page: { editorsInChief?: StaffEntryValue[]; editors?: StaffEntryValue[]; facultyAdviser?: StaffEntryValue[] } | undefined): true | string {
  const refs = [page?.editorsInChief, page?.editors, page?.facultyAdviser].flatMap((entries) => entries ?? []).flatMap((entry) => entry.contributor?._ref ? [entry.contributor._ref] : []);
  return new Set(refs).size === refs.length ? true : "Each contributor may appear only once across the About staff sections.";
}
async function validatePublishedStaffContributor(value: { _ref?: string } | undefined, context: { getClient: (options: { apiVersion: string }) => { fetch: (query: string, params: { id: string }) => Promise<string | null> } }) {
  if (!value?._ref) return true;
  const id = value._ref.replace(/^drafts\./, "");
  const published = await context.getClient({ apiVersion: "2025-02-19" }).fetch('*[_type == "contributor" && _id == $id][0]._id', { id });
  return published ? true : "Publish this contributor before adding them to About.";
}

export const staticPage = defineType({
  name: "staticPage",
  title: "Static page",
  type: "document",
  validation: (Rule) => Rule.custom((value) => validateUniqueStaff(value as Parameters<typeof validateUniqueStaff>[0])),
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "discovery", title: "Search and sharing" },
  ],
  fields: [
    defineField({ name: "title", title: "Page title", type: "string", group: "content", validation: (Rule) => Rule.required().max(140) }),
    defineField({ name: "slug", title: "Page slug", type: "slug", group: "content", description: "This document supplies the About page.", options: { source: "title", maxLength: 80 }, validation: (Rule) => Rule.required().custom((value) => !value?.current || permittedPageSlugs.includes(value.current) ? true : "The About page slug must be about.") }),
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string", group: "content", validation: (Rule) => Rule.max(80) }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3, group: "content", description: "Plain-language page summary used as metadata fallback.", validation: (Rule) => Rule.max(320) }),
    defineField({ name: "body", title: "Page body", type: "articleBody", group: "content", validation: (Rule) => Rule.required().min(1) }),
    defineField({ name: "editorsInChief", title: "Editors-in-Chief", type: "array", group: "content", components: { input: AboutStaffArrayInput }, of: [editorInChiefEntry()], validation: (Rule) => Rule.unique() }),
    defineField({ name: "editors", title: "Editors", type: "array", group: "content", components: { input: AboutStaffArrayInput }, of: [editorEntry()], validation: (Rule) => Rule.unique() }),
    defineField({ name: "facultyAdviser", title: "Faculty Adviser", type: "array", group: "content", components: { input: AboutStaffArrayInput }, of: [facultyAdviserEntry()], validation: (Rule) => Rule.max(1).unique() }),
    defineField({ name: "updatedDate", title: "Last substantive update", type: "datetime", group: "content", description: "Update when policy or institutional information materially changes." }),
    defineField({ name: "seo", title: "SEO overrides", type: "seo", group: "discovery" }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

function editorInChiefEntry() {
  return defineArrayMember({
    name: "editorInChiefEntry",
    title: "Editor-in-Chief",
    type: "object",
    fields: [
      defineField({ name: "contributor", title: "Contributor", type: "reference", to: [{ type: "contributor" }], options: { filter: "active != false" }, validation: (Rule) => Rule.required().custom(validatePublishedStaffContributor) }),
      defineField({ name: "displayedRole", title: "Displayed role", type: "string", description: "Optional label used on About; leave blank to use the section heading.", validation: (Rule) => Rule.max(100) }),
    ],
    preview: { select: { title: "contributor.name", subtitle: "displayedRole" } },
  });
}

function editorEntry() {
  return defineArrayMember({
    name: "editorEntry", title: "Editor", type: "object",
    fields: [
      defineField({ name: "contributor", title: "Contributor", type: "reference", to: [{ type: "contributor" }], options: { filter: "active != false" }, validation: (Rule) => Rule.required().custom(validatePublishedStaffContributor) }),
      defineField({ name: "displayedRole", title: "Displayed role", type: "string", validation: (Rule) => Rule.max(100) }),
    ],
    preview: { select: { title: "contributor.name", subtitle: "displayedRole" } },
  });
}

function facultyAdviserEntry() {
  return defineArrayMember({
    name: "facultyAdviserEntry", title: "Faculty Adviser", type: "object",
    fields: [
      defineField({ name: "contributor", title: "Contributor", type: "reference", to: [{ type: "contributor" }], options: { filter: "active != false" }, validation: (Rule) => Rule.required().custom(validatePublishedStaffContributor) }),
      defineField({ name: "displayedRole", title: "Displayed role", type: "string", validation: (Rule) => Rule.max(100) }),
    ],
    preview: { select: { title: "contributor.name", subtitle: "displayedRole" } },
  });
}
