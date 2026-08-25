"use client";

import { Box, Card, Text, Tooltip } from "@sanity/ui";
import { useFormValue, type PreviewProps } from "sanity";
import { getCitationOccurrences } from "../../content/citations";
import { footnoteSourceOptions } from "./FootnoteSourceInput";
import styles from "./FootnotePreview.module.css";

export function FootnotePreview(props: PreviewProps) {
  const sources = footnoteSourceOptions(useFormValue(["sources"]));
  const body = useFormValue(["body"]);
  const sourceKey = typeof props.title === "string" ? props.title : "";
  const occurrenceKey = typeof props.subtitle === "string" ? props.subtitle : "";
  const occurrence = getCitationOccurrences(Array.isArray(body) ? body : []).find(({ occurrenceId }) => occurrenceId === occurrenceKey);
  const index = sources.findIndex((source) => source.key === sourceKey);
  const sourceNumber = index >= 0 ? index + 1 : "?";
  const number = occurrence?.number ?? "?";

  return (
    <Tooltip content={<Box padding={2}><Text size={1}>{occurrence ? `Footnote ${number} · Source ${sourceNumber}` : "Footnote position unavailable"}</Text></Box>} placement="top" portal>
      <Card
        aria-label={occurrence ? `Footnote ${number}` : "Footnote position unavailable"}
        as="span"
        padding={1}
        radius={2}
        tone={occurrence && index >= 0 ? "primary" : "caution"}
      >
        <span className={styles.preview}><Text as="sup" size={1} weight="semibold">{number}</Text></span>
      </Card>
    </Tooltip>
  );
}
