import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { PreviewChrome } from "@/components/preview-chrome";
import { SiteShell } from "@/components/site-shell";
import { getSiteSettings } from "@/content";
import type { SiteSettings } from "@/content/types";
import { absoluteUrl } from "@/lib/metadata";
import "./globals.css";

function metadataFor(settings: SiteSettings): Metadata {
  return {
    metadataBase: new URL(settings.siteUrl),
    title: { default: settings.name, template: `%s | ${settings.name}` },
    description: settings.description,
    verification: {
      google: "kUNPyOTbMzBqXNCmA7UbIaEzdKmWrSWGaDM-ASwmnYM",
    },
    alternates: {
      canonical: "/",
      types: { "application/rss+xml": absoluteUrl("/feed.xml") },
    },
    openGraph: {
      type: "website",
      title: settings.name,
      description: settings.description,
      url: "/",
      siteName: settings.name,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.name,
      description: settings.description,
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const [preview, settings] = await Promise.all([(await draftMode()).isEnabled, getSiteSettings()]);
  const publicMetadata = metadataFor(settings);
  return preview
    ? { ...publicMetadata, robots: { index: false, follow: false, nocache: true } }
    : publicMetadata;
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [preview, settings] = await Promise.all([(await draftMode()).isEnabled, getSiteSettings()]);
  return (
    <html lang="en">
      <body>
        {preview && <PreviewChrome publicationName={settings.name} />}
        <SiteShell settings={settings}>{children}</SiteShell>
      </body>
    </html>
  );
}
