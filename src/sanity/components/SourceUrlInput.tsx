"use client";

import { Stack, Text, TextInput } from "@sanity/ui";
import { set, unset, type StringInputProps } from "sanity";

export function normalizeSourceUrl(value: string): string {
  return value.trim();
}

export function SourceUrlInput(props: StringInputProps) {
  const value = typeof props.value === "string" ? props.value : "";
  return <Stack space={2}>
    <TextInput
      aria-label="Source URL"
      onChange={(event) => {
        const next = normalizeSourceUrl(event.currentTarget.value);
        props.onChange(next ? set(next) : unset());
      }}
      placeholder="https://example.com/report"
      value={value}
    />
    <Text muted size={1}>Optional. Enter a full web address beginning with http:// or https://.</Text>
  </Stack>;
}
