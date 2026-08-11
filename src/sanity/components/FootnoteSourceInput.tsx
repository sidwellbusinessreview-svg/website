"use client";

import { Select, Stack, Text } from "@sanity/ui";
import { set, unset, useFormValue, type StringInputProps } from "sanity";

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
  return <Stack space={3}>
    <Select
      aria-label="Footnote source"
      value={typeof props.value === "string" ? props.value : ""}
      onChange={(event) => props.onChange(event.currentTarget.value ? set(event.currentTarget.value) : unset())}
    >
      <option value="">Select a source</option>
      {options.map((option, index) => <option value={option.key} key={option.key}>{index + 1}. {option.citation}</option>)}
    </Select>
    {options.length === 0 && <Text muted size={1}>Add a citation under Sources before inserting a footnote reference.</Text>}
  </Stack>;
}
