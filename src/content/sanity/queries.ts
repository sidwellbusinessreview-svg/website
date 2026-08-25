import { defineQuery } from "next-sanity";

const imageProjection = `{
  asset->{_id,url,metadata{dimensions{width,height,aspectRatio}}},
  crop,hotspot
}`;

const bodyProjection = `body[]{
  ...,
  _type == "editorialImage" => ${imageProjection},
  markDefs[]{...,"internalSlug": internalReference->slug.current,"internalType": internalReference->_type}
}`;

const articleProjection = `{
  _id,_type,title,"slug":slug.current,subtitle,summary,publicationMonth,publicationDate,pinned,featuredRank,
  seoTitle,seoDescription,
  "contributors": contributors[]->{_id,name,"slug":slug.current,graduationYear,active},
  "featuredImage": featuredImage${imageProjection},
  featuredImageAltText,featuredImageCaption,featuredImageCredit,
  sources[]{"key":_key,citation,url},
  ${bodyProjection}
}`;

// Visibility is controlled by the authenticated client's perspective. The
// published client cannot see drafts; the preview client resolves draft
// versions without maintaining a second set of queries.
const articleFilter = `_type == "article" && defined(slug.current)`;

export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  _id,_type,publicationName,shortName,description,affiliationText,tagline,location,logoMode,textWordmark,
  "logoImage": logoImage${imageProjection},logoImageAlt,contactLabel,contactTarget,
  socialLinks[]{label,url},defaultSeo,homepageTagline,
  aboutTitle,aboutEyebrow,aboutSummary,"aboutBody":aboutBody[]{
    ...,
    _type == "editorialImage" => ${imageProjection},
    markDefs[]{...,"internalSlug": internalReference->slug.current,"internalType": internalReference->_type}
  },aboutUpdatedDate,aboutSeo,
  editorsInChief[]{displayedRole,"contributor":contributor->{name,"slug":slug.current,graduationYear}},
  editors[]{displayedRole,"contributor":contributor->{name,"slug":slug.current,graduationYear}},
  facultyAdviser[]{displayedRole,"contributor":contributor->{name,"slug":slug.current,graduationYear}}
}`);

export const ALL_PUBLISHED_ARTICLES_QUERY = defineQuery(
  `*[${articleFilter}]|order(coalesce(publicationMonth,publicationDate) desc, slug.current asc)${articleProjection}`,
);
export const ARTICLE_BY_SLUG_QUERY = defineQuery(
  `*[${articleFilter} && slug.current == $slug][0]${articleProjection}`,
);
export const PINNED_ARTICLE_QUERY = defineQuery(
  `*[${articleFilter} && pinned == true]|order(featuredRank asc, coalesce(publicationMonth,publicationDate) desc, slug.current asc)[0]${articleProjection}`,
);
export const LATEST_ARTICLES_QUERY = defineQuery(
  `*[${articleFilter}]|order(coalesce(publicationMonth,publicationDate) desc, slug.current asc)[0...$limit]${articleProjection}`,
);
export const ARTICLES_BY_CONTRIBUTOR_QUERY = defineQuery(
  `*[${articleFilter} && $slug in contributors[]->slug.current]|order(coalesce(publicationMonth,publicationDate) desc, slug.current asc)${articleProjection}`,
);
export const SEARCH_ARTICLES_QUERY = defineQuery(
  `*[${articleFilter}]|order(coalesce(publicationMonth,publicationDate) desc, slug.current asc)${articleProjection}`,
);

export const CONTRIBUTORS_QUERY = defineQuery(`*[
  _type == "contributor" && defined(slug.current)
]|order(name asc){_id,_type,name,"slug":slug.current,graduationYear,active}`);
export const CONTRIBUTOR_BY_SLUG_QUERY = defineQuery(`*[
  _type == "contributor" && slug.current == $slug
][0]{_id,_type,name,"slug":slug.current,graduationYear,active}`);

export const articleProjectionForTests = articleProjection;
