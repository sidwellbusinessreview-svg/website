"use client";

import { Card, Select, Stack, Text } from "@sanity/ui";
import { set, unset, useFormValue, type StringInputProps } from "sanity";
import { getCitationOccurrences } from "../../content/citations";
import styles from "./FootnoteSourceInput.module.css";

export type FootnoteSourceOption = { key: string; citation: string };

export function footnoteSourceOptions(value: unknown): FootnoteSourceOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const key = typeof record._key === "string" ? record._key.trim() : "";
    const citation = typeof record.citation === "string" ? record.citation.trim() : "";
    return key && citation ? [{ key, citation }] : [];
  });
}

export function FootnoteSourceInput(props: StringInputProps) {
  const options = footnoteSourceOptions(useFormValue(["sources"]));
  const body = useFormValue(["body"]);
  const occurrenceKey = props.path.flatMap((segment) => typeof segment === "object" && segment && "_key" in segment && typeof segment._key === "string" ? [segment._key] : [])[0];
  const occurrence = getCitationOccurrences(Array.isArray(body) ? body : []).find(({ occurrenceId }) => occurrenceId === occurrenceKey);
  const selected = options.find(({ key }) => key === props.value);
  return <Card className={styles.editor} padding={3} radius={2}>
    <Stack space={3}>
    <Text weight="semibold">{occurrence ? `Footnote ${occurrence.number}` : "Footnote"}</Text>
    {selected && <Text className={styles.citation} size={1}>{selected.citation}</Text>}
    <Select
      aria-label="Change source"
      value={typeof props.value === "string" ? props.value : ""}
      onChange={(event) => props.onChange(event.currentTarget.value ? set(event.currentTarget.value) : unset())}
    >
      <option value="">Select a source</option>
      {options.map((option, index) => <option value={option.key} key={option.key}>Source {index + 1} · {option.citation}</option>)}
    </Select>
    <Text muted size={1}>Choose the Source for this citation. Published footnote numbers follow reading order.</Text>
    {options.length === 0 && <Text muted size={1}>Add a Source before inserting a footnote reference.</Text>}
    </Stack>
  </Card>;
}
