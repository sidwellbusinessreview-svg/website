"use client";

import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { ChevronDownIcon } from "@sanity/icons/ChevronDown";
import { ChevronUpIcon } from "@sanity/icons/ChevronUp";
import { DragHandleIcon } from "@sanity/icons/DragHandle";
import { EditIcon } from "@sanity/icons/Edit";
import { TrashIcon } from "@sanity/icons/Trash";
import { useMemo, useState } from "react";
import { set, unset, useFormValue, type ArrayOfObjectsInputProps } from "sanity";

export type ArticleSourceValue = {
  _key: string;
  _type: "articleSource";
  citation?: string;
  url?: string;
};

export function normalizedArticleSources(value: unknown): ArticleSourceValue[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const source = item as Record<string, unknown>;
    if (typeof source._key !== "string" || !source._key) return [];
    return [{
      _key: source._key,
      _type: "articleSource" as const,
      ...(typeof source.citation === "string" ? { citation: source.citation } : {}),
      ...(typeof source.url === "string" ? { url: source.url } : {}),
    }];
  });
}

export function moveArticleSource(value: ArticleSourceValue[], from: number, to: number): ArticleSourceValue[] {
  if (from < 0 || from >= value.length || to < 0 || to >= value.length || from === to) return value;
  const next = [...value];
  const [source] = next.splice(from, 1);
  next.splice(to, 0, source);
  return next;
}

function newSource(): ArticleSourceValue {
  return { _key: crypto.randomUUID().replaceAll("-", "").slice(0, 12), _type: "articleSource" };
}

function citedSourceKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((item) => citedSourceKeys(item, keys));
  else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.sourceKey === "string") keys.add(record.sourceKey);
    Object.values(record).forEach((item) => citedSourceKeys(item, keys));
  }
  return keys;
}

export function sourceRowWarnings(sources: ArticleSourceValue[], body: unknown): Map<string, string[]> {
  const warnings = new Map<string, string[]>();
  const cited = citedSourceKeys(body);
  sources.forEach((source, index) => {
    const own: string[] = [];
    const citation = source.citation?.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    const url = source.url?.trim().toLocaleLowerCase();
    const duplicateIndex = sources.findIndex((candidate, candidateIndex) => candidateIndex < index && (
      (citation && candidate.citation?.trim().replace(/\s+/g, " ").toLocaleLowerCase() === citation) ||
      (url && candidate.url?.trim().toLocaleLowerCase() === url)
    ));
    if (duplicateIndex >= 0) own.push(`Possibly duplicates Source ${duplicateIndex + 1}.`);
    if (!cited.has(source._key)) own.push("Not currently cited.");
    if (own.length) warnings.set(source._key, own);
  });
  return warnings;
}

export function ArticleSourcesInput(props: ArrayOfObjectsInputProps<ArticleSourceValue>) {
  const sources = normalizedArticleSources(props.value);
  const body = useFormValue(["body"]);
  const warnings = useMemo(() => sourceRowWarnings(sources, body), [body, sources]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const commit = (next: ArticleSourceValue[]) => props.onChange(next.length ? set(next) : unset());
  const update = (index: number, field: "citation" | "url", value: string) => {
    const next = sources.map((source, sourceIndex) => {
      if (sourceIndex !== index) return source;
      const updated = { ...source };
      if (value) updated[field] = value;
      else delete updated[field];
      return updated;
    });
    commit(next);
  };

  return (
    <Stack space={3} data-testid="article-sources-input">
      <Flex align="center" justify="space-between" gap={3} wrap="wrap">
        <Text muted size={1}>Add each Source once. Cite it as often as needed; published footnote numbers are assigned automatically in reading order. Source numbers here are lookup aids.</Text>
        <Button disabled={props.readOnly} fontSize={1} onClick={() => { const source = newSource(); commit([...sources, source]); setExpandedKey(source._key); }} text="Add source" tone="primary" />
      </Flex>
      {sources.length === 0 && <Card border padding={4} radius={2}><Text muted size={1}>No Sources yet. Add a Source before inserting a footnote.</Text></Card>}
      {sources.map((source, index) => (
        <Card
          border
          draggable={!props.readOnly}
          key={source._key}
          onDragEnd={() => setDraggedKey(null)}
          onDragOver={(event) => event.preventDefault()}
          onDragStart={() => setDraggedKey(source._key)}
          onDrop={() => {
            const from = sources.findIndex(({ _key }) => _key === draggedKey);
            if (from >= 0) commit(moveArticleSource(sources, from, index));
            setDraggedKey(null);
          }}
          padding={2}
          radius={2}
        >
          <Stack space={expandedKey === source._key ? 3 : 2}>
            <Flex align="center" gap={2}>
              <DragHandleIcon aria-hidden="true" />
              <Text size={1} weight="semibold">{index + 1}</Text>
              <Box flex={1} style={{ minWidth: 0 }}>
                <Text muted={!source.citation} size={1} textOverflow="ellipsis">{source.citation || "New Source"}</Text>
                {source.url && <Text muted size={0} textOverflow="ellipsis">{safeDomain(source.url)}</Text>}
              </Box>
              <Flex gap={1}>
                <Button aria-label={`Move Source ${index + 1} up`} disabled={props.readOnly || index === 0} icon={ChevronUpIcon} mode="bleed" onClick={() => commit(moveArticleSource(sources, index, index - 1))} padding={2} />
                <Button aria-label={`Move Source ${index + 1} down`} disabled={props.readOnly || index === sources.length - 1} icon={ChevronDownIcon} mode="bleed" onClick={() => commit(moveArticleSource(sources, index, index + 1))} padding={2} />
                <Button aria-label={`Edit Source ${index + 1}`} icon={EditIcon} mode="bleed" onClick={() => setExpandedKey(expandedKey === source._key ? null : source._key)} padding={2} />
                <Button aria-label={`Remove Source ${index + 1}`} disabled={props.readOnly} icon={TrashIcon} mode="bleed" onClick={() => commit(sources.filter((_, sourceIndex) => sourceIndex !== index))} padding={2} tone="critical" />
              </Flex>
            </Flex>
            {warnings.get(source._key)?.map((warning) => <Text key={warning} muted size={0}>{warning}</Text>)}
            {expandedKey === source._key && <>
            <Box>
              <Text as="label" htmlFor={`source-${source._key}-citation`} size={1} weight="medium">Citation</Text>
              <Box marginTop={2}><TextInput id={`source-${source._key}-citation`} onChange={(event) => update(index, "citation", event.currentTarget.value)} placeholder="Author or organization, title, publication, date" readOnly={props.readOnly} value={source.citation ?? ""} /></Box>
            </Box>
            <Box>
              <Text as="label" htmlFor={`source-${source._key}-url`} size={1} weight="medium">URL <span style={{ fontWeight: 400 }}>(optional)</span></Text>
              <Box marginTop={2}><TextInput id={`source-${source._key}-url`} onBlur={(event) => update(index, "url", event.currentTarget.value.trim())} onChange={(event) => update(index, "url", event.currentTarget.value)} placeholder="https://example.com/report" readOnly={props.readOnly} value={source.url ?? ""} /></Box>
            </Box>
            <Flex justify="flex-end"><Button mode="bleed" onClick={() => setExpandedKey(null)} text="Done" /></Flex>
            </>}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

function safeDomain(value: string): string {
  try { return new URL(value).hostname; } catch { return value; }
}
