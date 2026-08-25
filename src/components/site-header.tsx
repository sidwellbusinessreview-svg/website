import Link from "next/link";
import type { SiteSettings } from "@/content/types";
import { SiteLogo } from "./site-logo";

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="container utility-bar__inner">
          <span>{settings.affiliation}</span>
          <span>{settings.location}</span>
        </div>
      </div>
      <div className="container wordmark-header">
        <p className="wordmark-header__tagline">{settings.tagline}</p>
        <SiteLogo priority settings={settings} />
        <Link className="search-link" href="/search">
          Search <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <nav className="main-nav" aria-label="Primary navigation">
        <div className="container main-nav__inner">
          {settings.navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="main-nav__mobile-search" href="/search">Search</Link>
        </div>
      </nav>
    </header>
  );
}
