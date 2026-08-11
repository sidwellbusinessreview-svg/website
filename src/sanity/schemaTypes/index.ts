import type { SchemaTypeDefinition } from "sanity";
import { article } from "./documents/article";
import { contributor } from "./documents/contributor";
import { siteSettings } from "./documents/siteSettings";
import { staticPage } from "./documents/staticPage";
import { articleBody, callout, divider, footnoteReference, pullQuote, simplePortableText } from "./objects/articleBody";
import { editorialImage } from "./objects/editorialImage";
import { linkAnnotation } from "./objects/linkAnnotation";
import { seo } from "./objects/seo";

export const schemaTypes: SchemaTypeDefinition[] = [
  seo,
  editorialImage,
  linkAnnotation,
  simplePortableText,
  pullQuote,
  callout,
  divider,
  footnoteReference,
  articleBody,
  siteSettings,
  contributor,
  article,
  staticPage,
];
