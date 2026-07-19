"use client";

import { usePathname } from "next/navigation";
import { JsonLd } from "./json-ld";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/metadata";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/studio" || pathname.startsWith("/studio/")) return children;
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/"), description: siteConfig.description, parentOrganization: { "@type": "EducationalOrganization", name: siteConfig.school } }} />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
