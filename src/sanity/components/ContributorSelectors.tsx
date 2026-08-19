"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Button, Card, Dialog, Flex, Label, Stack, Text, TextInput } from "@sanity/ui";
import { PatchEvent, set, unset, useClient, type InputProps } from "sanity";
import { IntentLink } from "sanity/router";

export type ContributorReference = { _key: string; _type: "reference"; _ref: string };
export type ContributorCandidate = {
  _id: string;
  name: string;
  graduationYear?: number;
  active?: boolean;
};
export type StaffEntry = {
  _key: string;
  _type: "editorInChiefEntry" | "editorEntry" | "facultyAdviserEntry";
  contributor: ContributorReference;
  displayedRole?: string;
};

export type NormalizedContributorValues = {
  references: ContributorReference[];
  selectedIds: Set<string>;
  invalidIndices: number[];
};

export function normalizeContributorId(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim().replace(/^drafts\./, "");
}

export function normalizeContributorValues(value: unknown): NormalizedContributorValues {
  if (!Array.isArray(value)) return { references: [], selectedIds: new Set(), invalidIndices: [] };
  const references: ContributorReference[] = [];
  const selectedIds = new Set<string>();
  const invalidIndices: number[] = [];
  value.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") { invalidIndices.push(index); return; }
    const record = entry as Record<string, unknown>;
    const normalizedId = normalizeContributorId(record._ref);
    if (!normalizedId || selectedIds.has(normalizedId) || typeof record._key !== "string" || !record._key || record._type !== "reference") {
      invalidIndices.push(index);
      return;
    }
    selectedIds.add(normalizedId);
    references.push({ _key: record._key, _type: "reference", _ref: normalizedId });
  });
  return { references, selectedIds, invalidIndices };
}

export function createContributorReferences(ids: unknown[], existing: Set<string>, makeKey: () => string): ContributorReference[] {
  const seen = new Set(existing);
  return ids.flatMap((id) => {
    const normalized = normalizeContributorId(id);
    if (!normalized || seen.has(normalized)) return [];
    seen.add(normalized);
    const key = makeKey();
    return key ? [{ _key: key, _type: "reference" as const, _ref: normalized }] : [];
  });
}

export function createInvalidContributorRemovalPatches(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...normalizeContributorValues(value).invalidIndices].reverse().map((index) => {
    const entry = value[index];
    const key = entry && typeof entry === "object" && typeof (entry as Record<string, unknown>)._key === "string" ? (entry as Record<string, unknown>)._key as string : null;
    return unset(key ? [{ _key: key }] : [index]);
  });
}

export function reorderContributorReferences<T>(values: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= values.length || toIndex >= values.length) return values;
  const reordered = [...values];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);
  return reordered;
}

export function contributorSecondaryLine(candidate: Pick<ContributorCandidate, "graduationYear">) {
  return candidate.graduationYear ? `Class of ${candidate.graduationYear}` : "";
}

function useContributorCandidates(open: boolean, excludedId?: string) {
  const client = useClient({ apiVersion: "2025-02-19" });
  const [candidates, setCandidates] = useState<ContributorCandidate[]>([]);
  useEffect(() => {
    if (!open) return;
    let current = true;
    client.fetch<ContributorCandidate[]>('*[_type == "contributor" && !(_id in path("drafts.**")) && !(_id in path("versions.**")) && active != false && _id != $excluded]|order(name asc){_id,name,graduationYear,active}', { excluded: excludedId ?? "" })
      .then((records) => { if (current) setCandidates(records); })
      .catch(() => { if (current) setCandidates([]); });
    return () => { current = false; };
  }, [client, excludedId, open]);
  return candidates;
}

function useContributorMetadata(ids: string[]) {
  const client = useClient({ apiVersion: "2025-02-19" });
  const [records, setRecords] = useState<ContributorCandidate[]>([]);
  const key = ids.join("|");
  useEffect(() => {
    if (!ids.length) return;
    let current = true;
    client.fetch<ContributorCandidate[]>('*[_type == "contributor" && !(_id in path("drafts.**")) && _id in $ids]{_id,name,graduationYear,active}', { ids })
      .then((items) => { if (current) setRecords(items); })
      .catch(() => { if (current) setRecords([]); });
    return () => { current = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, key]);
  return new Map(records.map((record) => [record._id, record]));
}

export function ContributorPickerDialog({
  open,
  alreadySelected = new Set<string>(),
  excludedId,
  multiple = true,
  confirmLabel = "Confirm selection",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  alreadySelected?: Set<string>;
  excludedId?: string;
  multiple?: boolean;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (candidates: ContributorCandidate[]) => void;
}) {
  const candidates = useContributorCandidates(open, excludedId);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<Set<string>>(new Set());
  const matches = candidates.filter((candidate) => candidate.name.toLowerCase().includes(query.trim().toLowerCase()));
  if (!open) return null;
  const toggle = (id: string) => setPending((current) => {
    const next = multiple ? new Set(current) : new Set<string>();
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const chosen = candidates.filter(({ _id }) => pending.has(_id));
  const cancel = () => { setQuery(""); setPending(new Set()); onCancel(); };
  const confirm = () => { onConfirm(chosen); setQuery(""); setPending(new Set()); };
  return <Dialog header="Add contributors" id="contributor-selector" onClose={cancel} width={1}>
    <Box padding={4}><Stack space={4}>
      <Stack space={2}><Label>Search by name</Label><TextInput aria-label="Search by name" autoFocus id="contributor-search" onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search contributors" value={query} /></Stack>
      <Text muted size={1} aria-live="polite">{pending.size} selected</Text>
      <Stack space={2}>
        {matches.map((candidate) => {
          const alreadyAdded = alreadySelected.has(candidate._id);
          const selected = pending.has(candidate._id);
          return <Card as="button" aria-pressed={selected} border disabled={alreadyAdded} key={candidate._id} onClick={() => !alreadyAdded && toggle(candidate._id)} padding={3} radius={2} tone={selected ? "primary" : "default"} style={{ textAlign: "left", width: "100%" }}>
            <Flex align="center" gap={3} justify="space-between"><Stack space={2}><Text weight="semibold">{candidate.name}</Text>{contributorSecondaryLine(candidate) && <Text muted size={1}>{contributorSecondaryLine(candidate)}</Text>}</Stack><Flex align="center" gap={2}><Badge tone="positive">Active</Badge><Text size={1} weight="semibold">{alreadyAdded ? "Already added" : selected ? "Selected" : "Select"}</Text></Flex></Flex>
          </Card>;
        })}
        {!matches.length && <Card border padding={3}><Text muted>No matching active published contributors.</Text></Card>}
      </Stack>
      <Flex gap={3} justify="flex-end"><Button mode="bleed" text="Cancel" onClick={cancel} /><Button disabled={!chosen.length} text={confirmLabel} tone="primary" onClick={confirm} /></Flex>
    </Stack></Box>
  </Dialog>;
}

function ContributorRow({ candidate, index, count, onMove, onRemove }: { candidate?: ContributorCandidate; index: number; count: number; onMove: (to: number) => void; onRemove: () => void }) {
  return <Card border padding={3} radius={2}><Flex align="center" gap={3} justify="space-between" wrap="wrap">
    <Flex align="center" gap={3}><Text aria-hidden="true" muted>↕</Text><Stack space={2}><Text weight="semibold">{candidate?.name ?? "Contributor record unavailable"}</Text>{candidate && contributorSecondaryLine(candidate) && <Text muted size={1}>{contributorSecondaryLine(candidate)}</Text>}</Stack></Flex>
    <Flex gap={2} wrap="wrap"><Button aria-label={`Move ${candidate?.name ?? "contributor"} up`} disabled={index === 0} mode="bleed" text="Up" onClick={() => onMove(index - 1)} /><Button aria-label={`Move ${candidate?.name ?? "contributor"} down`} disabled={index === count - 1} mode="bleed" text="Down" onClick={() => onMove(index + 1)} />{candidate && <Button as={IntentLink} intent="edit" mode="bleed" params={{ id: candidate._id, type: "contributor" }} text="Open contributor" />}<Button mode="bleed" text="Remove" tone="critical" onClick={onRemove} /></Flex>
  </Flex></Card>;
}

export function ContributorArrayInput(props: InputProps) {
  const [open, setOpen] = useState(false);
  const normalized = useMemo(() => normalizeContributorValues(props.value), [props.value]);
  const ids = normalized.references.map(({ _ref }) => _ref);
  const metadata = useContributorMetadata(ids);
  const change = (next: ContributorReference[]) => props.onChange(PatchEvent.from(next.length ? set(next) : unset()));
  return <Stack space={3}>
    {normalized.references.map((reference, index) => <ContributorRow candidate={metadata.get(reference._ref)} count={normalized.references.length} index={index} key={reference._key} onMove={(to) => change(reorderContributorReferences(normalized.references, index, to))} onRemove={() => change(normalized.references.filter(({ _key }) => _key !== reference._key))} />)}
    {!normalized.references.length && !normalized.invalidIndices.length && <Card border padding={3}><Text muted>No contributors selected.</Text></Card>}
    {!!normalized.invalidIndices.length && <Card padding={3} radius={2} tone="caution"><Stack space={3}><Text>{normalized.invalidIndices.length} malformed or duplicate legacy {normalized.invalidIndices.length === 1 ? "entry was" : "entries were"} ignored.</Text><Flex><Button mode="ghost" text="Repair invalid entries" onClick={() => props.onChange(PatchEvent.from(createInvalidContributorRemovalPatches(props.value)))} /></Flex></Stack></Card>}
    <Flex><Button text="Add contributors" onClick={() => setOpen(true)} /></Flex>
    <ContributorPickerDialog alreadySelected={normalized.selectedIds} open={open} onCancel={() => setOpen(false)} onConfirm={(chosen) => { const additions = createContributorReferences(chosen.map(({ _id }) => _id), normalized.selectedIds, () => crypto.randomUUID().replaceAll("-", "")); if (additions.length) change([...normalized.references, ...additions]); setOpen(false); }} />
  </Stack>;
}

function normalizeStaffEntries(value: unknown): { entries: StaffEntry[]; invalid: number[] } {
  if (!Array.isArray(value)) return { entries: [], invalid: [] };
  const seen = new Set<string>(); const entries: StaffEntry[] = []; const invalid: number[] = [];
  value.forEach((item, index) => {
    if (!item || typeof item !== "object") { invalid.push(index); return; }
    const entry = item as StaffEntry;
    const ref = normalizeContributorId(entry.contributor?._ref);
    if (!entry._key || !ref || seen.has(ref)) { invalid.push(index); return; }
    seen.add(ref); entries.push({ ...entry, contributor: { ...entry.contributor, _type: "reference", _ref: ref } });
  });
  return { entries, invalid };
}

export function AboutStaffArrayInput(props: InputProps) {
  const field = props.schemaType.name;
  const single = field === "facultyAdviser";
  const entryType: StaffEntry["_type"] = field === "editorsInChief" ? "editorInChiefEntry" : field === "facultyAdviser" ? "facultyAdviserEntry" : "editorEntry";
  const [open, setOpen] = useState(false);
  const normalized = useMemo(() => normalizeStaffEntries(props.value), [props.value]);
  const ids = normalized.entries.map(({ contributor }) => contributor._ref);
  const metadata = useContributorMetadata(ids);
  const change = (next: StaffEntry[]) => props.onChange(PatchEvent.from(next.length ? set(next) : unset()));
  const selected = new Set(ids);
  return <Stack space={3}>
    {normalized.entries.map((entry, index) => <Card border key={entry._key} padding={3} radius={2}><Stack space={3}>
      <ContributorRow candidate={metadata.get(entry.contributor._ref)} count={normalized.entries.length} index={index} onMove={(to) => change(reorderContributorReferences(normalized.entries, index, to))} onRemove={() => change(normalized.entries.filter(({ _key }) => _key !== entry._key))} />
      <Stack space={2}><Label>Displayed role</Label><TextInput aria-label={`Displayed role for ${metadata.get(entry.contributor._ref)?.name ?? "contributor"}`} id={`${field}-${entry._key}-role`} onChange={(event) => change(normalized.entries.map((item) => item._key === entry._key ? { ...item, displayedRole: event.currentTarget.value } : item))} placeholder="Optional About-page label" value={entry.displayedRole ?? ""} /></Stack>
    </Stack></Card>)}
    {!normalized.entries.length && !normalized.invalid.length && <Card border padding={3}><Text muted>No staff selected.</Text></Card>}
    {!!normalized.invalid.length && <Card padding={3} tone="caution"><Stack space={3}><Text>Malformed or duplicate legacy staff entries were ignored.</Text><Button mode="ghost" text="Repair invalid entries" onClick={() => change(normalized.entries)} /></Stack></Card>}
    <Flex><Button disabled={single && normalized.entries.length >= 1} text={field === "facultyAdviser" ? "Add faculty adviser" : field === "editorsInChief" ? "Add Editor-in-Chief" : "Add contributors"} onClick={() => setOpen(true)} /></Flex>
    <ContributorPickerDialog alreadySelected={selected} multiple={!single} open={open} onCancel={() => setOpen(false)} onConfirm={(chosen) => { const additions = chosen.flatMap((candidate) => selected.has(candidate._id) ? [] : [{ _key: crypto.randomUUID().replaceAll("-", ""), _type: entryType, contributor: { _key: crypto.randomUUID().replaceAll("-", ""), _type: "reference" as const, _ref: candidate._id } }]); if (additions.length) change(single ? additions.slice(0, 1) : [...normalized.entries, ...additions]); setOpen(false); }} />
  </Stack>;
}
