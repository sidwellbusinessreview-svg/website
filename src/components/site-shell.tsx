import type { SiteSettings } from "@/content/types";
import { JsonLd } from "./json-ld";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { absoluteUrl } from "@/lib/metadata";

export function SiteShell({ children, settings }: { children: React.ReactNode; settings: SiteSettings }) {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: settings.name, url: absoluteUrl("/"), description: settings.description, parentOrganization: { "@type": "EducationalOrganization", name: settings.school } }} />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader settings={settings} />
      <main id="main-content">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
