import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { SiteSettings } from "@/content/types";

export interface SiteLogoProps {
  compact?: boolean;
  className?: string;
  priority?: boolean;
  settings?: SiteSettings;
}

export function SiteLogo({
  compact = false,
  className = "",
  priority = false,
  settings,
}: SiteLogoProps) {
  const resolved = settings ?? siteConfig;
  const label = `${resolved.name} home`;
  const logoClassName = ["site-logo", compact && "site-logo--compact", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Link className={logoClassName} href="/" aria-label={label}>
      {compact ? (
        <span className="site-logo__monogram" aria-hidden="true">
          {resolved.shortName}
        </span>
      ) : resolved.logo.mode === "image" ? (
        <Image
          className="site-logo__image"
          src={resolved.logo.imageSrc}
          alt={resolved.logo.imageAlt}
          width={resolved.logo.imageWidth}
          height={resolved.logo.imageHeight}
          preload={priority}
        />
      ) : (
        <span>{resolved.logo.textWordmark}</span>
      )}
    </Link>
  );
}
