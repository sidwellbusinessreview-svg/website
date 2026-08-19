import type { SchemaTypeDefinition } from "sanity";
import { article } from "./documents/article";
import { contributor } from "./documents/contributor";
import { siteSettings } from "./documents/siteSettings";
import { articleBody, callout, footnoteReference, simplePortableText } from "./objects/articleBody";
import { editorialImage } from "./objects/editorialImage";
import { linkAnnotation } from "./objects/linkAnnotation";
import { seo } from "./objects/seo";

export const schemaTypes: SchemaTypeDefinition[] = [
  seo,
  editorialImage,
  linkAnnotation,
  simplePortableText,
  callout,
  footnoteReference,
  articleBody,
  siteSettings,
  contributor,
  article,
];
