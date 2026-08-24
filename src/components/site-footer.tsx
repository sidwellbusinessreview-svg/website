import Link from "next/link";
import type { SiteSettings } from "@/content/types";
import { SiteLogo } from "./site-logo";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <SiteLogo settings={settings} />
          <p>{settings.description}</p>
        </div>
        <div>
          <p className="eyebrow">Publication</p>
          <Link href="/about">About</Link>
          <Link href="/archive">Archive</Link>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <a href={`mailto:${settings.contact.email}`}>
            {settings.contact.label}
          </a>
          {settings.socialLinks.map((link) => (
            <a key={link.href} href={link.href} rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {settings.name}</span>
        <span>Editorially independent.</span>
      </div>
    </footer>
  );
}
