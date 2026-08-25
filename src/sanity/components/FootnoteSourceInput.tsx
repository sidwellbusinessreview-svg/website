"use client";

import { Autocomplete, Card, Stack, Text } from "@sanity/ui";
import { set, unset, useFormValue, type StringInputProps } from "sanity";
import { getCitationOccurrences } from "../../content/citations";
import styles from "./FootnoteSourceInput.module.css";

export type FootnoteSourceOption = { key: string; citation: string };
type FootnotePickerOption = { value: string; label: string; number: string };

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

export function matchesFootnoteSource(query: string, option: { label: string; number: string }): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  return option.number === normalized || option.label.toLocaleLowerCase().includes(normalized);
}

export function FootnoteSourceInput(props: StringInputProps) {
  const options = footnoteSourceOptions(useFormValue(["sources"]));
  const body = useFormValue(["body"]);
  const occurrenceKey = props.path.flatMap((segment) => typeof segment === "object" && segment && "_key" in segment && typeof segment._key === "string" ? [segment._key] : [])[0];
  const occurrence = getCitationOccurrences(Array.isArray(body) ? body : []).find(({ occurrenceId }) => occurrenceId === occurrenceKey);
  const selected = options.find(({ key }) => key === props.value);
  const pickerOptions: FootnotePickerOption[] = options.map((option, index) => ({
    value: option.key,
    label: `Source ${index + 1} · ${option.citation}`,
    number: String(index + 1),
  }));
  return <Card className={styles.editor} padding={3} radius={2}>
    <Stack space={3}>
    <Text weight="semibold">{occurrence ? `Footnote ${occurrence.number}` : "Footnote"}</Text>
    {selected && <Text className={styles.citation} size={1}>{selected.citation}</Text>}
    <Autocomplete<FootnotePickerOption>
      aria-label="Change source"
      filterOption={matchesFootnoteSource}
      id="footnote-source-change"
      onChange={(value) => {
        if (!value) props.onChange(unset());
      }}
      onSelect={(value) => props.onChange(value ? set(value) : unset())}
      openButton
      openOnFocus
      options={pickerOptions}
      placeholder="Search Sources"
      renderOption={(option) => <Card as="button" padding={3}><Text size={1}>{option.label}</Text></Card>}
      renderValue={(_value, option) => option?.label ?? selected?.citation ?? ""}
      value={typeof props.value === "string" ? props.value : ""}
    />
    <Text muted size={1}>Choose the Source for this footnote. Published numbers follow reading order.</Text>
    {options.length === 0 && <Text muted size={1}>Add a Source before inserting a footnote reference.</Text>}
    </Stack>
  </Card>;
}
