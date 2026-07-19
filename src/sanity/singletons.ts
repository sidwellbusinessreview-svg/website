import type { DocumentActionComponent, InitialValueTemplateItem, TemplateItem } from "sanity";
export const SITE_SETTINGS_ID = "siteSettings";
export const ABOUT_ID = "about";
export const singletonTypes = new Set(["siteSettings", "staticPage"]);
export function filterSingletonTemplates<T extends { schemaType: string }>(templates: T[]): T[] { return templates.filter((template) => !singletonTypes.has(template.schemaType)); }
export function filterSingletonActions(actions: DocumentActionComponent[], schemaType: string): DocumentActionComponent[] { return singletonTypes.has(schemaType) ? actions.filter((action) => action.action !== "delete" && action.action !== "duplicate") : actions; }
export function filterSingletonNewDocumentOptions(options: Array<InitialValueTemplateItem | TemplateItem>) { return options.filter((option) => !["siteSettings", "staticPage"].includes(option.templateId)); }
