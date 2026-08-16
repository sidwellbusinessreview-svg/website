import type { ArticleInput, Contributor } from "./types";

const photos = {
  city: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85",
  chips: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=85",
  shop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85",
  metro: "https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=1800&q=85",
  books: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1800&q=85",
  meeting: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1800&q=85",
  solar: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1800&q=85",
  street: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1800&q=85",
};

export const contributors: Contributor[] = [
  {
    slug: "maya-chen",
    name: "Maya Chen",
    role: "Editor in Chief",
    grade: "Class of 2026",
  },
  {
    slug: "jonah-patel",
    name: "Jonah Patel",
    role: "Economics Editor",
    grade: "Class of 2027",
  },
  {
    slug: "lena-brooks",
    name: "Lena Brooks",
    role: "Technology Editor",
    grade: "Class of 2026",
  },
  {
    slug: "samir-okafor",
    name: "Samir Okafor",
    role: "Staff Writer",
    grade: "Class of 2028",
  },
];

const opening = [
  {
    type: "paragraph" as const,
    text: "Business stories are rarely only about business. They are about incentives, institutions, people, and the uneven consequences of change. That is especially clear in Washington, where national policy meets neighborhood-level reality.",
  },
  {
    type: "heading" as const,
    level: 2 as const,
    text: "The decision beneath the headline",
  },
  {
    type: "paragraph" as const,
    text: "The most useful question is not whether a trend is good or bad in the abstract. It is who made the underlying decision, what constraints they faced, and which tradeoffs became invisible once the final number appeared.",
  },
];

export const articles: ArticleInput[] = [
  {
    slug: "the-new-economics-of-school-lunch",
    title: "The New Economics of School Lunch",
    dek: "Rising costs, tighter budgets, and changing tastes are reshaping one of the school day’s most familiar institutions.",
    contributorSlugs: ["maya-chen", "jonah-patel"],
    publicationMonth: "2026-05",
    pinned: true,
    featuredImage: {
      src: photos.meeting,
      alt: "Students gathered around a table in a bright common space",
      caption: "Every lunch menu reflects a chain of choices about labor, sourcing, price, and demand.",
      credit: "Photo by Headway / Unsplash",
    },
    content: [
      ...opening,
      {
        type: "quote",
        text: "A lunch price is not one number. It is a compressed account of dozens of choices.",
        content: [{ text: "A lunch price is not one number. It is a compressed account of dozens of choices.", sourceKey: "usda" }],
      },
      {
        type: "paragraph",
        text: "Food-service operators balance nutrition standards, student preferences, staffing, waste, and supplier contracts. A small change in any one variable can move the whole system.",
        content: [{ text: "Food-service operators balance nutrition standards, student preferences, staffing, waste, and supplier contracts. A small change in any one variable can move the whole system.", sourceKey: "budget" }],
      },
      {
        type: "bulletedList",
        items: [
          "Ingredient and transportation costs",
          "Kitchen staffing and preparation time",
          "Demand forecasting and food waste",
          "Affordability for students and families",
        ],
      },
      {
        type: "callout",
        title: "What to watch",
        text: "The strongest programs will measure participation and waste alongside cost. A cheaper meal that students do not choose is not an efficient meal.",
        sourceKey: "usda",
      },
      { type: "divider" },
      {
        type: "heading",
        level: 2,
        text: "A local laboratory",
      },
      {
        type: "paragraph",
        text: "Schools can test ideas at a human scale. Clearer pricing, smaller batches, and more regular student feedback can turn the cafeteria into a practical lesson in operations.",
        content: [{ text: "Schools can test ideas at a human scale. Clearer pricing, smaller batches, and more regular student feedback can turn the cafeteria into a practical lesson in operations.", sourceKey: "usda" }],
      },
      {
        type: "link",
        text: "Readers interested in the wider policy context can explore federal school nutrition data.",
        label: "Visit the USDA Food and Nutrition Service",
        href: "https://www.fns.usda.gov/",
      },
    ],
    sources: [
      { key: "usda", citation: "U.S. Department of Agriculture, “School Nutrition Programs.”", url: "https://www.fns.usda.gov/school-meals" },
      { key: "budget", citation: "School Nutrition Association, “2025 School Nutrition Trends Report.”" },
    ],
  },
  {
    slug: "semiconductors-and-the-geography-of-risk",
    title:
      "Semiconductors and the Geography of Risk in a World That Can No Longer Take Frictionless Trade for Granted",
    dek: "The chip supply chain reveals how efficiency, national security, and resilience now compete for corporate attention.",
    contributorSlugs: ["lena-brooks"],
    publicationMonth: "2026-05",
    featuredImage: {
      src: photos.chips,
      alt: "Close view of a computer circuit board",
      credit: "Photo by Alexandre Debiève / Unsplash",
    },
    content: [
      {
        type: "paragraph",
        text: "A modern semiconductor may cross borders dozens of times before it reaches a consumer. Design, fabrication, packaging, testing, and assembly often happen in different countries, each selected for a distinct concentration of expertise.",
      },
      {
        type: "heading",
        level: 2,
        text: "Efficiency meets resilience",
      },
      {
        type: "paragraph",
        text: "For decades, firms optimized these networks for cost and speed. Recent shocks changed the calculation. Executives now assign value to redundancy, geographic diversity, and political stability—even when those qualities raise near-term expenses.",
      },
      {
        type: "image",
        src: photos.city,
        alt: "Modern office towers viewed from below",
        caption: "Industrial policy is pulling corporate strategy closer to government.",
        credit: "Photo by Samson / Unsplash",
      },
      {
        type: "numberedList",
        items: [
          "Map concentration across suppliers and regions.",
          "Price the cost of a prolonged interruption.",
          "Decide which redundancies are worth maintaining.",
        ],
      },
      {
        type: "quote",
        text: "Resilience is not the opposite of efficiency; it is a broader definition of what efficient systems must survive.",
        attribution: "SBR analysis",
      },
      ...Array.from({ length: 6 }, (_, index) => ({
        type: "paragraph" as const,
        text: `The long-term question is whether new capacity can produce more than symbolic security. Investment cycle ${index + 1} will require skilled workers, reliable infrastructure, patient capital, and customers willing to absorb higher costs while production scales.`,
      })),
      {
        type: "heading",
        level: 2,
        text: "The student investor’s view",
      },
      {
        type: "paragraph",
        text: "For young investors, the lesson is to look past the product category. A chip company’s exposure depends on where it sits in the value chain, how replaceable its expertise is, and how much bargaining power it holds.",
      },
    ],
  },
  {
    slug: "small-businesses-big-rates",
    title: "Small Businesses, Big Rates",
    dek: "For local entrepreneurs, higher borrowing costs turn ordinary decisions into consequential bets.",
    contributorSlugs: ["samir-okafor"],
    publicationMonth: "2026-04",
    featuredImage: {
      src: photos.shop,
      alt: "Interior of an independent retail shop",
      credit: "Photo by Clark Street Mercantile / Unsplash",
    },
    content: [
      ...opening,
      {
        type: "callout",
        title: "The core tradeoff",
        text: "Waiting preserves cash, but it can also surrender a good location, delay hiring, or leave demand unmet.",
      },
      {
        type: "paragraph",
        text: "Large companies can issue bonds or draw on multiple credit lines. A neighborhood business may depend on one bank relationship and a personal guarantee.",
      },
    ],
  },
  {
    slug: "what-metro-ridership-can-tell-us",
    title: "What Metro Ridership Can Tell Us About Washington’s New Workweek",
    dek: "Transit patterns provide a surprisingly clear view of hybrid work, downtown demand, and a region still finding its rhythm.",
    contributorSlugs: ["jonah-patel"],
    publicationMonth: "2026-02",
    featuredImage: {
      src: photos.metro,
      alt: "Underground train platform",
      credit: "Photo by Charles Forerunner / Unsplash",
    },
    content: [
      ...opening,
      {
        type: "image",
        src: photos.street,
        alt: "A busy city street at dusk",
        caption: "Commuting patterns shape demand well beyond the transit system.",
        credit: "Photo by Denys Nevozhai / Unsplash",
      },
      {
        type: "paragraph",
        text: "A quieter platform affects coffee shops, office landlords, dry cleaners, and tax collections. Mobility is a useful proxy for the wider urban economy.",
      },
      {
        type: "image",
        src: photos.city,
        alt: "Glass office buildings in a downtown district",
        caption: "Office districts are adapting to fewer five-day commuters.",
        credit: "Photo by Samson / Unsplash",
      },
      {
        type: "image",
        src: photos.shop,
        alt: "Shelves inside a small city store",
        caption: "Retailers feel changes in weekday foot traffic immediately.",
        credit: "Photo by Clark Street Mercantile / Unsplash",
      },
    ],
  },
  {
    slug: "reading-the-fed",
    title: "Reading the Fed Without Reading Tea Leaves",
    dek: "A practical guide to separating central-bank signals from market noise.",
    contributorSlugs: ["maya-chen"],
    publicationMonth: "2026-01",
    featuredImage: {
      src: photos.books,
      alt: "Open books and notes on a desk",
      credit: "Photo by Patrick Tomasso / Unsplash",
    },
    content: [
      ...opening,
      {
        type: "numberedList",
        items: [
          "Begin with the policy decision itself.",
          "Compare the statement with the prior version.",
          "Treat projections as scenarios, not promises.",
          "Separate market reaction from economic meaning.",
        ],
      },
    ],
  },
  {
    slug: "solar-club-capital-budget",
    title: "How a Student Solar Proposal Became a Capital-Budget Lesson",
    dek: "A campus sustainability idea shows why payback periods are only the beginning of an investment case.",
    contributorSlugs: ["lena-brooks"],
    publicationMonth: "2025-12",
    featuredImage: {
      src: photos.solar,
      alt: "Rows of solar panels facing the sun",
      credit: "Photo by American Public Power Association / Unsplash",
    },
    content: [
      ...opening,
      {
        type: "quote",
        text: "The proposal improved once the students stopped treating uncertainty as a weakness and began treating it as a variable.",
      },
      {
        type: "bulletedList",
        items: [
          "Up-front installation expense",
          "Expected energy savings",
          "Maintenance and useful life",
          "Educational and environmental value",
        ],
      },
    ],
  },
];
