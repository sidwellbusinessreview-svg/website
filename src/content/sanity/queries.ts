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
  _id,title,"slug":slug.current,subtitle,summary,publicationDate,pinned,featuredRank,
  seoTitle,seoDescription,
  "contributors": contributors[]->{_id,name,"slug":slug.current,role,graduationYear,active},
  "featuredImage": featuredImage${imageProjection},
  featuredImageAltText,featuredImageCaption,featuredImageCredit,
  ${bodyProjection}
}`;

const publishedArticleFilter = `_type == "article" && !(_id in path("drafts.**")) && defined(slug.current)`;

export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  publicationName,shortName,description,affiliationText,tagline,location,logoMode,textWordmark,
  "logoImage": logoImage${imageProjection},logoImageAlt,contactLabel,contactTarget,
  socialLinks[]{label,url},defaultSeo,homepageTagline
}`);

export const ALL_PUBLISHED_ARTICLES_QUERY = defineQuery(
  `*[${publishedArticleFilter}]|order(publicationDate desc, slug.current asc)${articleProjection}`,
);
export const ARTICLE_BY_SLUG_QUERY = defineQuery(
  `*[${publishedArticleFilter} && slug.current == $slug][0]${articleProjection}`,
);
export const PINNED_ARTICLE_QUERY = defineQuery(
  `*[${publishedArticleFilter} && pinned == true]|order(featuredRank asc, publicationDate desc, slug.current asc)[0]${articleProjection}`,
);
export const LATEST_ARTICLES_QUERY = defineQuery(
  `*[${publishedArticleFilter}]|order(publicationDate desc, slug.current asc)[0...$limit]${articleProjection}`,
);
export const ARTICLES_BY_CONTRIBUTOR_QUERY = defineQuery(
  `*[${publishedArticleFilter} && $slug in contributors[]->slug.current]|order(publicationDate desc, slug.current asc)${articleProjection}`,
);
export const SEARCH_ARTICLES_QUERY = defineQuery(
  `*[${publishedArticleFilter} && [title,subtitle,summary,pt::text(body),contributors[]->name] match $term]|order(publicationDate desc, slug.current asc)${articleProjection}`,
);

export const CONTRIBUTORS_QUERY = defineQuery(`*[
  _type == "contributor" && !(_id in path("drafts.**")) && defined(slug.current)
]|order(name asc){_id,name,"slug":slug.current,role,graduationYear,active}`);
export const CONTRIBUTOR_BY_SLUG_QUERY = defineQuery(`*[
  _type == "contributor" && !(_id in path("drafts.**")) && slug.current == $slug
][0]{_id,name,"slug":slug.current,role,graduationYear,active}`);

export const STATIC_PAGE_BY_SLUG_QUERY = defineQuery(`*[
  _type == "staticPage" && !(_id in path("drafts.**")) && slug.current == $slug
][0]{title,"slug":slug.current,eyebrow,summary,${bodyProjection},
  editorsInChief[]{displayedRole,"contributor":contributor->{name,"slug":slug.current,role,graduationYear}},
  editors[]{displayedRole,"contributor":contributor->{name,"slug":slug.current,role,graduationYear}},
  facultyAdviser[]{displayedRole,"contributor":contributor->{name,"slug":slug.current,role,graduationYear}}
}`);

export const articleProjectionForTests = articleProjection;
