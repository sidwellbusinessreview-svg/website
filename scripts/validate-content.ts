import { validatedContent } from "../src/content/validation";

console.log(
  `Content valid: ${validatedContent.articles.length} articles, ` +
    `${validatedContent.authors.length} authors, ` +
    `${validatedContent.issues.length} issues, and ` +
    `${validatedContent.categories.length} categories.`,
);
