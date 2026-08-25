"use client";

import { Grid, Select, Stack, Text, TextInput } from "@sanity/ui";
import { useState } from "react";
import { set, unset, type StringInputProps } from "sanity";

export const PUBLICATION_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export function parsePublicationMonth(value: unknown): { month: string; year: string } {
  const match = typeof value === "string" ? value.match(/^(\d{4})-(0[1-9]|1[0-2])$/) : null;
  return match ? { month: match[2], year: match[1] } : { month: "", year: "" };
}

export function normalizedPublicationMonth(month: string, year: string): string | undefined {
  return /^(0[1-9]|1[0-2])$/.test(month) && /^\d{4}$/.test(year) ? `${year}-${month}` : undefined;
}

export function PublicationMonthInput(props: StringInputProps) {
  const external = parsePublicationMonth(props.value);
  const [month, setMonth] = useState(external.month);
  const [year, setYear] = useState(external.year);

  const commit = (nextMonth: string, nextYear: string) => {
    const normalized = normalizedPublicationMonth(nextMonth, nextYear);
    props.onChange(normalized ? set(normalized) : unset());
  };

  return <Stack space={3}>
    <Grid columns={[1, 2]} gap={3}>
      <Select aria-label="Publication month" value={month} onChange={(event) => { const next = event.currentTarget.value; setMonth(next); commit(next, year); }}>
        <option value="">Choose month</option>
        {PUBLICATION_MONTHS.map((label, index) => <option value={String(index + 1).padStart(2, "0")} key={label}>{label}</option>)}
      </Select>
      <TextInput aria-label="Publication year" inputMode="numeric" maxLength={4} placeholder="Year" value={year} onChange={(event) => { const next = event.currentTarget.value.replace(/\D/g, "").slice(0, 4); setYear(next); commit(month, next); }} />
    </Grid>
    <Text muted size={1}>{year && year.length < 4 ? "Enter a four-digit year." : "Choose the month and enter the four-digit year. No publication day is stored."}</Text>
  </Stack>;
}
