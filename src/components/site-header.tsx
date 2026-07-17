import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SiteLogo } from "./site-logo";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="container utility-bar__inner">
          <span>{siteConfig.affiliation}</span>
          <span>{siteConfig.location}</span>
        </div>
      </div>
      <div className="container masthead">
        <p className="masthead__tagline">{siteConfig.tagline}</p>
        <SiteLogo priority />
        <Link className="search-link" href="/search">
          Search <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <nav className="main-nav" aria-label="Primary navigation">
        <div className="container main-nav__inner">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <details className="mobile-nav">
        <summary>Menu</summary>
        <nav aria-label="Mobile navigation">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/search">Search</Link>
        </nav>
      </details>
    </header>
  );
}
