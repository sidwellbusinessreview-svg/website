import type { DocumentActionComponent, DocumentActionProps, InitialValueTemplateItem, TemplateItem } from "sanity";
export const SITE_SETTINGS_ID = "siteSettings";
export const ABOUT_ID = "about";
export const singletonDefinitions = [
  { schemaType: "staticPage", documentId: ABOUT_ID, title: "About" },
  { schemaType: "siteSettings", documentId: SITE_SETTINGS_ID, title: "Site Settings" },
] as const;
export type SingletonSchemaType = typeof singletonDefinitions[number]["schemaType"];
export const singletonTypes: ReadonlySet<string> = new Set(singletonDefinitions.map(({ schemaType }) => schemaType));
export function isSingletonSchemaType(schemaType: string): schemaType is SingletonSchemaType { return singletonTypes.has(schemaType); }
export function singletonDefinitionForType(schemaType: string) { return singletonDefinitions.find((definition) => definition.schemaType === schemaType); }
export function filterSingletonTemplates<T extends { schemaType: string }>(templates: T[]): T[] { return templates.filter((template) => !singletonTypes.has(template.schemaType)); }
function singletonDiscardAction(Action: DocumentActionComponent): DocumentActionComponent {
  const Guarded: DocumentActionComponent = (props: DocumentActionProps) => {
    const result = Action(props);
    if (!props.draft || !props.published) return null;
    return result ? { ...result, label: "Discard unpublished changes" } : null;
  };
  Guarded.action = "discardChanges";
  return Guarded;
}
export function filterSingletonActions(actions: DocumentActionComponent[], schemaType: string): DocumentActionComponent[] {
  if (!isSingletonSchemaType(schemaType)) return actions;
  return actions.flatMap((action) => {
    if (action.action === "publish") return [action];
    if (action.action === "discardChanges") return [singletonDiscardAction(action)];
    return [];
  });
}
export function filterSingletonNewDocumentOptions(options: Array<InitialValueTemplateItem | TemplateItem>) { return options.filter((option) => !["siteSettings", "staticPage"].includes(option.templateId)); }
