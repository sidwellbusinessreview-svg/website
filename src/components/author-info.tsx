import Link from "next/link";
import type { Author } from "@/content";

export function AuthorInfo({ author, linked = true }: { author: Author; linked?: boolean }) {
  const content = (
    <>
      <span className="author-avatar" aria-hidden="true">{author.initials}</span>
      <span>
        <strong>{author.name}</strong>
        <small>{author.role} · {author.grade}</small>
      </span>
    </>
  );
  return linked ? (
    <Link className="author-info" href={`/authors/${author.slug}`}>{content}</Link>
  ) : (
    <div className="author-info">{content}</div>
  );
}
