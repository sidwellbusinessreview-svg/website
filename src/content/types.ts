export type Category =
  | "Markets"
  | "Economics"
  | "Technology"
  | "Entrepreneurship"
  | "Policy"
  | "Campus";

export type ArticleContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "bulletedList"; items: string[] }
  | { type: "numberedList"; items: string[] }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "pullQuote"; text: string }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      credit?: string;
    }
  | { type: "callout"; title?: string; text: string }
  | { type: "divider" }
  | { type: "link"; text: string; href: string; label: string };

export interface Author {
  slug: string;
  name: string;
  role: string;
  grade: string;
  bio: string;
  initials: string;
}

export interface Article {
  slug: string;
  title: string;
  dek: string;
  category: Category;
  authorSlugs: string[];
  issueSlug: string;
  publishedAt: string;
  readTime: number;
  pinned?: boolean;
  featuredImage: {
    src: string;
    alt: string;
    caption?: string;
    credit?: string;
  };
  content: ArticleContentBlock[];
}

export interface Issue {
  slug: string;
  title: string;
  number: number;
  season: string;
  year: number;
  description: string;
  editorNote: string;
  articleSlugs: string[];
  accent: string;
}
