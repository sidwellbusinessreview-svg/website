import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="site-logo" href="/" aria-label={`${siteConfig.name} home`}>
      {compact ? (
        <span className="site-logo__monogram" aria-hidden="true">
          {siteConfig.shortName}
        </span>
      ) : (
        <span>{siteConfig.name}</span>
      )}
    </Link>
  );
}
