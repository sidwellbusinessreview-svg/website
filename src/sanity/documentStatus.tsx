"use client";

import { useState } from "react";
import { Box, Button, Flex, Stack, Text } from "@sanity/ui";
import { useDocumentOperation, type DocumentActionComponent, type DocumentActionProps, type DocumentBadgeComponent } from "sanity";
import { articleStatusLabel } from "./articleState";
import { ArticlePermanentDeleteAction, ContributorArchiveAction, ContributorDeleteAction } from "./lifecycleActions";
import { filterSingletonActions, isSingletonSchemaType } from "./singletons";
import { singletonDocumentState, singletonStatusLabel } from "./singletonState";

export const ArticleStatusBadge: DocumentBadgeComponent = (props) => ({
  label: articleStatusLabel(props.draft, props.published),
  title: props.draft && props.published ? "The public article remains live while these edits are unpublished." : props.published ? "This version is published." : "This article has not been published.",
  color: props.draft && props.published ? "warning" : props.published ? "success" : "primary",
});

export const ContributorAvailabilityBadge: DocumentBadgeComponent = (props) => ({
  label: (props.draft ?? props.published)?.active === false ? "Archived Contributor" : "Active Contributor",
  title: (props.draft ?? props.published)?.active === false ? "Not available for selection on new articles." : "Available for selection on new articles.",
  color: (props.draft ?? props.published)?.active === false ? "primary" : "success",
});

export const SingletonStatusBadge: DocumentBadgeComponent = (props) => {
  const state = singletonDocumentState(props.draft, props.published);
  return {
    label: singletonStatusLabel(props.draft, props.published),
    title: state === "publishedWithChanges" ? "The published version remains public until these changes are published." : state === "publishedOnly" ? "This fixed page is published and remains editable." : state === "draftOnly" ? "This fixed page has not been published." : "Use the permanent page entry to create or recover this document.",
    color: state === "publishedWithChanges" ? "warning" : state === "publishedOnly" ? "success" : "primary",
  };
};

export function relabelPublishAction(Action: DocumentActionComponent): DocumentActionComponent {
  const Relabeled: DocumentActionComponent = (props) => {
    const result = Action(props);
    if (!result) return null;
    return { ...result, label: props.published ? "Publish changes" : "Publish" };
  };
  Relabeled.action = "publish";
  return Relabeled;
}

export function relabelDiscardAction(Action: DocumentActionComponent): DocumentActionComponent {
  const Relabeled: DocumentActionComponent = (props) => {
    const result = Action(props);
    return result ? { ...result, label: "Discard unpublished changes" } : null;
  };
  Relabeled.action = "discardChanges";
  return Relabeled;
}

export const UnpublishArticleAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const [confirming, setConfirming] = useState(false);
  const { unpublish } = useDocumentOperation(props.id, props.type);
  if (!props.published) return null;
  return {
    label: "Unpublish article",
    tone: "critical",
    disabled: Boolean(unpublish.disabled),
    onHandle: () => setConfirming(true),
    dialog: confirming ? {
      type: "dialog", header: "Unpublish article", onClose: () => setConfirming(false),
      content: <Box padding={4}><Stack space={4}><Text>Unpublishing removes this article from the public site after CMS integration while preserving an editable draft where Sanity supports it.</Text><Flex gap={3} justify="flex-end"><Button mode="bleed" text="Cancel" onClick={() => setConfirming(false)} /><Button tone="critical" text="Unpublish article" onClick={() => { unpublish.execute(); setConfirming(false); props.onComplete(); }} /></Flex></Stack></Box>,
    } : undefined,
  };
};
UnpublishArticleAction.action = "unpublish";

export function resolveDocumentActions(actions: DocumentActionComponent[], schemaType: string): DocumentActionComponent[] {
  if (isSingletonSchemaType(schemaType)) return filterSingletonActions(actions, schemaType);
  const removeDuplicate = ["article", "contributor", "staticPage", "siteSettings"].includes(schemaType);
  let resolved = removeDuplicate ? actions.filter((action) => action.action !== "duplicate") : actions;
  resolved = resolved.filter((action) => action.action !== "delete");
  if (schemaType === "contributor") return [...resolved, ContributorArchiveAction, ContributorDeleteAction];
  if (schemaType !== "article") return resolved;
  resolved = resolved.filter((action) => action.action !== "unpublish").map((action) => action.action === "publish" ? relabelPublishAction(action) : action.action === "discardChanges" ? relabelDiscardAction(action) : action);
  const publishIndex = resolved.findIndex((action) => action.action === "publish");
  if (publishIndex > 0) resolved = [resolved[publishIndex], ...resolved.slice(0, publishIndex), ...resolved.slice(publishIndex + 1)];
  return [...resolved, UnpublishArticleAction, ArticlePermanentDeleteAction];
}
