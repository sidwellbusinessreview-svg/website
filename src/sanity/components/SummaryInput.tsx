"use client";

import { Card, Flex, Text } from "@sanity/ui";
import type { TextInputProps } from "sanity";

export function SummaryInput(props: TextInputProps) {
  const count = typeof props.value === "string" ? props.value.length : 0;
  return (
    <Card>
      {props.renderDefault(props)}
      <Flex justify="flex-end" paddingTop={2}>
        <Text muted size={1}>{count}/300 characters</Text>
      </Flex>
    </Card>
  );
}
