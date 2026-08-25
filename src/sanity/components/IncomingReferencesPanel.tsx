"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Card, Flex, Stack, Text } from "@sanity/ui";
import { useClient, useFormValue, type ObjectInputProps } from "sanity";
import { IntentLink } from "sanity/router";

type ReferencingDocument = { _id: string; _type: string; title?: string; _originalId?: string };

export function ContributorDocumentInput(props: ObjectInputProps) {
  const rawId = useFormValue(["_id"]);
  const id = typeof rawId === "string" ? rawId.replace(/^drafts\./, "") : "";
  const client = useClient({ apiVersion: "2025-02-19" });
  const [documents, setDocuments] = useState<ReferencingDocument[] | null>(null);
  useEffect(() => {
    if (!id) return;
    client.withConfig({ perspective: "raw", useCdn: false }).fetch<ReferencingDocument[]>('*[references($id)]{_id,_type,title,"_originalId":_id}', { id }).then(setDocuments).catch(() => setDocuments([]));
  }, [client, id]);
  const articles = documents?.filter(({ _type }) => _type === "article") ?? [];
  const about = documents?.filter(({ _type }) => _type === "siteSettings") ?? [];
  const other = documents?.filter(({ _type }) => !["article", "siteSettings"].includes(_type)) ?? [];
  return <><Card aria-live="polite" border marginBottom={4} padding={4} radius={2}><Stack space={4}>
    <Text size={2} weight="semibold">Referenced by</Text>
    {!documents ? <Text muted>Checking where this contributor is used…</Text> : <>
      <Text>This contributor is used by {articles.length} {articles.length === 1 ? "article" : "articles"}{about.length ? " and the About page" : ""}.</Text>
      {[...articles, ...about, ...other].map((document) => <Card border key={document._id} padding={3} radius={2}><Flex align="center" gap={3} justify="space-between"><Box><IntentLink intent="edit" params={{ id: document._id.replace(/^drafts\./, ""), type: document._type }}>{document.title || (document._type === "siteSettings" ? "Publication Settings" : "Untitled")}</IntentLink></Box><Badge tone={document._id.startsWith("drafts.") ? "caution" : "positive"}>{document._id.startsWith("drafts.") ? "Unpublished changes" : "Published"}</Badge></Flex></Card>)}
      {!documents.length && <Text muted>Nothing currently references this contributor.</Text>}
    </>}
  </Stack></Card>{props.renderDefault(props)}</>;
}
