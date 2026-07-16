import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SiteLogo } from "./site-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <SiteLogo />
          <p>{siteConfig.description}</p>
        </div>
        <div>
          <p className="eyebrow">Publication</p>
          <Link href="/about">About</Link>
          <Link href="/masthead">Masthead</Link>
          <Link href="/issues">Archive</Link>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          <p>{siteConfig.school}</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <span>Student-run. Editorially independent.</span>
      </div>
    </footer>
  );
}
