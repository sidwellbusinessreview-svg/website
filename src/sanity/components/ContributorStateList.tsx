"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useClient } from "sanity";
import { IntentLink } from "sanity/router";

type ContributorRecord = { _id: string; name?: string; role?: string; active?: boolean };
type ContributorState = "active" | "archived" | "all";

export function pairContributorVersions(records: ContributorRecord[]): ContributorRecord[] {
  const pairs = new Map<string, { draft?: ContributorRecord; published?: ContributorRecord }>();
  for (const record of records) {
    const draft = record._id.startsWith("drafts.");
    const id = record._id.replace(/^drafts\./, "");
    const pair = pairs.get(id) ?? {};
    if (draft) pair.draft = record; else pair.published = record;
    pairs.set(id, pair);
  }
  return [...pairs.entries()].map(([id, pair]) => ({ ...(pair.draft ?? pair.published)!, _id: id })).sort((a, b) => (a.name || "").localeCompare(b.name || "") || a._id.localeCompare(b._id));
}

export function ContributorStateList({ options }: { options?: Record<string, unknown> }) {
  const state = (options?.state ?? "all") as ContributorState;
  const title = typeof options?.title === "string" ? options.title : "Contributors";
  const client = useClient({ apiVersion: "2025-02-19" });
  const [records, setRecords] = useState<ContributorRecord[] | null>(null);
  const [error, setError] = useState(false);
  const load = useCallback(() => {
    setError(false); setRecords(null);
    client.withConfig({ perspective: "raw", useCdn: false }).fetch<ContributorRecord[]>('*[_type == "contributor" && !(_id in path("versions.**"))]{_id,name,role,active}')
      .then((contributors) => setRecords(pairContributorVersions(contributors).filter(({ active }) => state === "all" || (state === "active" ? active !== false : active === false))))
      .catch((reason: unknown) => { console.error("Contributor list query failed", reason); setError(true); });
  }, [client, state]);
  useEffect(() => {
    let current = true;
    client.withConfig({ perspective: "raw", useCdn: false }).fetch<ContributorRecord[]>('*[_type == "contributor" && !(_id in path("versions.**"))]{_id,name,role,active}')
      .then((contributors) => { if (current) setRecords(pairContributorVersions(contributors).filter(({ active }) => state === "all" || (state === "active" ? active !== false : active === false))); })
      .catch((reason: unknown) => { if (current) { console.error("Contributor list query failed", reason); setError(true); } });
    return () => { current = false; };
  }, [client, state]);
  if (error) return <Flex align="center" height="fill" justify="center" padding={5}><Card padding={5} tone="critical"><Stack space={3}><Text>Contributors could not be loaded.</Text><Button text="Retry" onClick={load} /></Stack></Card></Flex>;
  if (!records) return <Flex align="center" aria-live="polite" height="fill" justify="center" padding={5}><Text muted>Loading contributors…</Text></Flex>;
  return <Box padding={5}><Stack space={4}><Flex align="center" gap={4} justify="space-between"><Stack space={2}><Text as="h1" size={4} weight="bold">{title}</Text><Text size={1}>{records.length} {records.length === 1 ? "contributor" : "contributors"}</Text></Stack><Button as={IntentLink} intent="create" params={{ type: "contributor" }} text="New contributor" tone="primary" /></Flex>{records.length === 0 && <Card border padding={4}><Text muted>No contributors are in this list.</Text></Card>}{records.map((record) => <Card border key={record._id} padding={4} radius={2}><Flex align="center" gap={3} justify="space-between"><Stack space={2}><IntentLink intent="edit" params={{ id: record._id, type: "contributor" }}>{record.name || "Unnamed contributor"}</IntentLink>{record.role && <Text muted size={1}>{record.role}</Text>}</Stack><Badge tone={record.active === false ? "default" : "positive"}>{record.active === false ? "Archived" : "Active"}</Badge></Flex></Card>)}</Stack></Box>;
}
