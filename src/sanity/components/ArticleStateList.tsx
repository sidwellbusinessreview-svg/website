"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Box, Button, Card, Flex, Label, Select, Stack, Text, TextInput } from "@sanity/ui";
import { useClient } from "sanity";
import { IntentLink } from "sanity/router";
import {
  articleStatusLabel,
  classifyArticleVersions,
  searchArticleRecords,
  sortArticleRecords,
  type ArticleDocumentState,
  type ArticleSort,
  type ArticleVersion,
} from "../articleState";

type PaneProps = { options?: Record<string, unknown> };

const ARTICLE_LIST_QUERY = `*[_type == "article" && !(_id in path("versions.**"))]{
  _id,
  title,
  subtitle,
  summary,
  publicationDate,
  _updatedAt,
  pinned,
  "contributorNames": contributors[]->name,
  "thumbnailUrl": featuredImage.asset->url
}`;

function stateTone(state: ArticleDocumentState) {
  return state === "published" ? "positive" as const : "caution" as const;
}

export function ArticleStateList({ options }: PaneProps) {
  const state = options?.state as ArticleDocumentState | "all" | "pinned" | undefined;
  const title = typeof options?.title === "string" ? options.title : "Articles";
  const description = typeof options?.description === "string" ? options.description : "Browse and open editorial articles.";
  const client = useClient({ apiVersion: "2025-02-19" });
  const [versions, setVersions] = useState<ArticleVersion[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ArticleSort>("newest");

  const load = useCallback(() => {
    setError(false);
    setVersions(null);
    client.withConfig({ perspective: "raw", useCdn: false }).fetch<ArticleVersion[]>(ARTICLE_LIST_QUERY)
      .then(setVersions)
      .catch((reason: unknown) => {
        console.error("Article list query failed", reason);
        setError(true);
      });
  }, [client]);

  useEffect(() => {
    let active = true;
    client.withConfig({ perspective: "raw", useCdn: false }).fetch<ArticleVersion[]>(ARTICLE_LIST_QUERY)
      .then((result) => { if (active) setVersions(result); })
      .catch((reason: unknown) => { if (active) { console.error("Article list query failed", reason); setError(true); } });
    return () => { active = false; };
  }, [client]);

  const records = useMemo(() => classifyArticleVersions(versions ?? []).filter((record) =>
    state === "all" || !state || (state === "pinned" ? record.pinned : record.state === state)), [state, versions]);
  const visibleRecords = useMemo(() => sortArticleRecords(searchArticleRecords(records, query), sort), [query, records, sort]);

  if (error) return <Flex align="center" height="fill" justify="center" padding={5}><Card padding={5} radius={3} tone="critical"><Stack space={4}><Text align="center">Articles could not be loaded. Other Studio sections are still available.</Text><Flex justify="center"><Button text="Retry" tone="primary" onClick={load} /></Flex></Stack></Card></Flex>;
  if (!versions) return <Flex align="center" aria-live="polite" height="fill" justify="center" padding={5}><Text muted>Loading articles…</Text></Flex>;

  return <Box padding={5}><Stack space={5}>
    <Flex align="flex-start" gap={4} justify="space-between" wrap="wrap">
      <Stack space={2}><Text as="h1" size={4} weight="bold">{title}</Text><Text muted>{description}</Text><Text size={1}>{records.length} {records.length === 1 ? "article" : "articles"}</Text></Stack>
      <Button as={IntentLink} intent="create" params={{ type: "article" }} text="New article" tone="primary" />
    </Flex>

    <Card border padding={4} radius={2}><Flex align="flex-end" gap={4} wrap="wrap">
      <Box flex={1} style={{ minWidth: 220 }}><Stack space={2}><Label>Search articles</Label><TextInput aria-label="Search articles" onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Title, contributor, summary, or date" value={query} /></Stack></Box>
      {query && <Button mode="bleed" text="Clear search" onClick={() => setQuery("")} />}
      <Box style={{ minWidth: 210 }}><Stack space={2}><Label>Sort articles</Label><Select aria-label="Sort articles" onChange={(event) => setSort(event.currentTarget.value as ArticleSort)} value={sort}><option value="newest">Newest publication date</option><option value="oldest">Oldest publication date</option><option value="title">Title A–Z</option><option value="updated">Recently updated</option></Select></Stack></Box>
    </Flex></Card>

    {query && <Text aria-live="polite" size={1}>{visibleRecords.length} of {records.length} articles match “{query}”.</Text>}
    {visibleRecords.length === 0 && <Card border padding={5} radius={2}><Stack space={3}><Text weight="semibold">{query ? "No articles match this search." : "No articles are in this state."}</Text>{query && <Flex><Button mode="ghost" text="Clear search" onClick={() => setQuery("")} /></Flex>}</Stack></Card>}

    <Stack space={3}>{visibleRecords.map((record) => <Card border key={record.id} padding={4} radius={2}>
      <Flex align="flex-start" gap={4} wrap="wrap">
        {/* Studio thumbnails use Sanity's already-sized asset URL and are deliberately decorative. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {record.thumbnailUrl && <img alt="" height={72} loading="lazy" src={record.thumbnailUrl} style={{ borderRadius: 3, height: 72, objectFit: "cover", width: 108 }} width={108} />}
        <Box flex={1} style={{ minWidth: 220 }}><Stack space={3}>
          <Stack space={2}><Text as="h2" size={2} weight="semibold"><IntentLink intent="edit" params={{ id: record.id, type: "article" }}>{record.title}</IntentLink></Text>{(record.subtitle || record.summary) && <Text muted size={1}>{record.subtitle || shorten(record.summary)}</Text>}</Stack>
          <Flex gap={2} wrap="wrap"><Badge tone={stateTone(record.state)}>{articleStatusLabel(record.state !== "published", record.state !== "draftOnly")}</Badge>{record.pinned && <Badge tone="primary">Pinned</Badge>}</Flex>
          <Flex gap={3} wrap="wrap"><Text muted size={1}>{record.contributorNames.length ? record.contributorNames.join(", ") : "Contributor not selected"}</Text>{record.publicationDate && <Text muted size={1}>{record.publicationDate}</Text>}</Flex>
        </Stack></Box>
        <Button as={IntentLink} intent="edit" mode="ghost" params={{ id: record.id, type: "article" }} text={`Open ${record.title}`} />
      </Flex>
    </Card>)}</Stack>
  </Stack></Box>;
}

function shorten(value?: string) {
  if (!value || value.length <= 150) return value;
  return `${value.slice(0, 147).trimEnd()}…`;
}
