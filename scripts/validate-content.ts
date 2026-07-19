import { validatedContent } from "../src/content/validation";

console.log(
  `Content valid: ${validatedContent.articles.length} articles, ` +
    `${validatedContent.contributors.length} contributors.`,
);
