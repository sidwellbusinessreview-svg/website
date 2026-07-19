import type {
  Article as DomainArticle,
  Contributor as DomainContributor,
  SiteSettings as DomainSiteSettings,
} from "@/content/types";
import type {
  Article as SanityArticle,
  Contributor as SanityContributor,
  SiteSettings as SanitySiteSettings,
} from "@/sanity/sanity.types";

/**
 * The provider adapter that Phase 12 will implement before any public route reads
 * from Sanity. Generated Sanity records must never leak through the content layer.
 */
export interface SanityDomainAdapter {
  article(document: SanityArticle): DomainArticle;
  contributor(document: SanityContributor): DomainContributor;
  siteSettings(document: SanitySiteSettings): DomainSiteSettings;
}
