export const siteConfig = {
  name: "Sidwell Business Review",
  shortName: "SBR",
  affiliation: "A student publication of Sidwell Friends School",
  description:
    "A student-run publication examining business, economics, markets, and ideas from Sidwell Friends School.",
  tagline: "Business, markets, and ideas—examined by students.",
  contact: {
    label: "Contact the editors",
    email: "editors@sidwellbusinessreview.org",
  },
  socialLinks: [] as Array<{
    label: string;
    href: string;
  }>,
  logo: {
    mode: "text" as "text" | "image",
    textWordmark: "Sidwell Business Review",
    imageSrc: "/brand/logo.png",
    imageAlt: "Sidwell Business Review",
    imageWidth: 720,
    imageHeight: 180,
  },
  school: "Sidwell Friends School",
  location: "Washington, D.C.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  navigation: [
    { label: "Latest", href: "/latest" },
    { label: "Archive", href: "/archive" },
    { label: "About", href: "/about" },
  ],
} as const;
