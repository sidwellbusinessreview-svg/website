import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export interface SiteLogoProps {
  compact?: boolean;
  className?: string;
  priority?: boolean;
}

export function SiteLogo({
  compact = false,
  className = "",
  priority = false,
}: SiteLogoProps) {
  const label = `${siteConfig.name} home`;
  const logoClassName = ["site-logo", compact && "site-logo--compact", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Link className={logoClassName} href="/" aria-label={label}>
      {compact ? (
        <span className="site-logo__monogram" aria-hidden="true">
          {siteConfig.shortName}
        </span>
      ) : siteConfig.logo.mode === "image" ? (
        <Image
          className="site-logo__image"
          src={siteConfig.logo.imageSrc}
          alt={siteConfig.logo.imageAlt}
          width={siteConfig.logo.imageWidth}
          height={siteConfig.logo.imageHeight}
          priority={priority}
        />
      ) : (
        <span>{siteConfig.logo.textWordmark}</span>
      )}
    </Link>
  );
}
