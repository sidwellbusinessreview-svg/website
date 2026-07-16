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
  navigation: [
    { label: "Latest", href: "/latest" },
    { label: "Issues", href: "/issues" },
    { label: "Authors", href: "/authors" },
    { label: "About", href: "/about" },
    { label: "Masthead", href: "/masthead" },
  ],
} as const;
