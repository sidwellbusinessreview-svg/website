"use client";

import { useState } from "react";
import { Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useClient, type DocumentActionComponent, type DocumentActionProps } from "sanity";
import { IntentLink } from "sanity/router";
import { replaceContributorReferences } from "../../scripts/sanity/content-operations";
import { ContributorPickerDialog, contributorSecondaryLine, type ContributorCandidate } from "./components/ContributorSelectors";

type ReferenceDocument = { _id: string; _type: string; title?: string; contributors?: Array<{ _key?: string; _ref: string }> };

async function deleteVariants(client: ReturnType<typeof useClient>, id: string) {
  await client.transaction().delete(`drafts.${id}`).delete(id).commit();
}

export const ContributorArchiveAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: "2025-02-19" });
  const active = (props.draft ?? props.published)?.active !== false;
  return {
    label: active ? "Archive contributor" : "Restore contributor",
    onHandle: async () => {
      const ids = [props.draft?._id, props.published?._id].filter((id): id is string => Boolean(id));
      let transaction = client.transaction();
      for (const id of ids) transaction = transaction.patch(id, { set: { active: !active } });
      await transaction.commit();
      props.onComplete();
    },
  };
};

export const ContributorDeleteAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient({ apiVersion: "2025-02-19" });
  const id = props.id.replace(/^drafts\./, "");
  const [references, setReferences] = useState<ReferenceDocument[] | null>(null);
  const [replacement, setReplacement] = useState<ContributorCandidate | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmReassignment, setConfirmReassignment] = useState(false);
  const inspect = async () => {
    const found = await client.withConfig({ perspective: "raw", useCdn: false }).fetch<ReferenceDocument[]>('*[references($id)]{_id,_type,title,contributors}', { id });
    setReferences(found);
    setOpen(true);
  };
  const articles = references?.filter(({ _type }) => _type === "article") ?? [];
  const about = references?.filter(({ _type }) => _type === "siteSettings") ?? [];
  const removeAboutAndDelete = async () => {
    try { setBusy(true); setError("");
      let transaction = client.transaction();
      for (const page of about) for (const field of ["editorsInChief", "editors", "facultyAdviser"]) transaction = transaction.patch(page._id, { unset: [`${field}[contributor._ref=="${id}"]`] });
      transaction = transaction.delete(`drafts.${id}`).delete(id);
      await transaction.commit(); props.onComplete();
    } catch { setError("Cannot delete until references are resolved. Refresh the list and try again."); } finally { setBusy(false); }
  };
  const reassign = async () => {
    if (!replacement) return;
    try { setBusy(true); setError("");
      const latest = await client.withConfig({ perspective: "raw", useCdn: false }).fetch<ReferenceDocument[]>('*[_type == "article" && references($id)]{_id,_type,title,contributors}', { id });
      let transaction = client.transaction();
      for (const article of latest) transaction = transaction.patch(article._id, { set: { contributors: replaceContributorReferences(article.contributors ?? [], id, replacement._id) } });
      for (const page of about) for (const field of ["editorsInChief", "editors", "facultyAdviser"]) transaction = transaction.patch(page._id, { unset: [`${field}[contributor._ref=="${id}"]`] });
      await transaction.commit();
      const unresolved = await client.withConfig({ perspective: "raw", useCdn: false }).fetch<number>('count(*[references($id)])', { id });
      if (unresolved) throw new Error("References remain");
      await deleteVariants(client, id);
      props.onComplete();
    } catch { setError("Reassignment could not be completed. No contributor was deleted. Refresh the references and try again."); } finally { setBusy(false); setConfirmReassignment(false); }
  };
  const permanentlyDelete = async () => {
    try { setBusy(true); setError(""); await deleteVariants(client, id); props.onComplete(); } catch { setError("Cannot delete until references are resolved."); } finally { setBusy(false); }
  };
  const archive = async () => {
    const ids = [props.draft?._id, props.published?._id].filter((documentId): documentId is string => Boolean(documentId));
    let transaction = client.transaction();
    for (const documentId of ids) transaction = transaction.patch(documentId, { set: { active: false } });
    try { setBusy(true); await transaction.commit(); props.onComplete(); } finally { setBusy(false); }
  };
  return {
    label: "Delete contributor",
    tone: "critical",
    onHandle: inspect,
    dialog: open ? {
      type: "dialog", header: confirmReassignment ? "Confirm reassignment and deletion" : "Delete contributor", onClose: () => { if (!busy) { setOpen(false); setConfirmReassignment(false); setError(""); } },
      content: <Box padding={4}><Stack space={4}>
        <Text>{confirmReassignment ? "This will replace the contributor on every referenced draft and published article, verify that no references remain, and then permanently delete the contributor. This cannot be undone." : articles.length ? `This contributor is used by ${articles.length} ${articles.length === 1 ? "article" : "articles"} and cannot be deleted until those bylines are resolved.` : about.length ? "This contributor is used only by the About page." : "This contributor has no incoming references."}</Text>
        {!confirmReassignment && [...articles, ...about].map((reference) => <Card key={reference._id} border padding={3} radius={2}><Flex align="center" justify="space-between" gap={3}><IntentLink intent="edit" params={{ id: reference._id.replace(/^drafts\./, ""), type: reference._type }}>{reference.title || "Publication Settings"}</IntentLink><Text muted size={1}>{reference._id.startsWith("drafts.") ? "Unpublished changes" : "Published"}</Text></Flex></Card>)}
        {!confirmReassignment && articles.length > 0 && <Stack space={3}>
          <Button disabled={busy} mode="ghost" text="Archive contributor (recommended)" onClick={archive} />
          {replacement ? <Card border padding={3} radius={2}><Stack space={2}><Text weight="semibold">{replacement.name}</Text>{contributorSecondaryLine(replacement) && <Text muted size={1}>{contributorSecondaryLine(replacement)}</Text>}<Flex><Button mode="bleed" text="Change replacement" onClick={() => setPickerOpen(true)} /></Flex></Stack></Card> : <Flex><Button text="Choose replacement contributor" onClick={() => setPickerOpen(true)} /></Flex>}
        </Stack>}
        {error && <Card padding={3} radius={2} tone="critical"><Text role="alert">{error}</Text></Card>}
        <Flex gap={3} justify="flex-end">
          <Button disabled={busy} mode="bleed" text="Cancel" onClick={() => { setOpen(false); setConfirmReassignment(false); setError(""); }} />
          {!confirmReassignment && articles.length > 0 && <Button disabled={!replacement || busy} tone="critical" text="Continue" onClick={() => setConfirmReassignment(true)} />}
          {confirmReassignment && <Button disabled={busy} tone="critical" text={busy ? "Reassigning…" : "Reassign articles and delete contributor"} onClick={reassign} />}
          {!confirmReassignment && !articles.length && about.length > 0 && <Button disabled={busy} tone="critical" text="Remove from About and delete" onClick={removeAboutAndDelete} />}
          {!confirmReassignment && !articles.length && !about.length && <Button disabled={busy} tone="critical" text="Delete contributor permanently" onClick={permanentlyDelete} />}
        </Flex>
        <ContributorPickerDialog confirmLabel="Confirm reassignment" excludedId={id} multiple={false} open={pickerOpen} onCancel={() => setPickerOpen(false)} onConfirm={(chosen) => { setReplacement(chosen[0] ?? null); setPickerOpen(false); }} />
      </Stack></Box>,
    } : undefined,
  } as never;
};

export const ArticlePermanentDeleteAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: "2025-02-19" });
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const published = Boolean(props.published);
  return {
    label: published ? "Delete article permanently" : "Delete draft permanently",
    tone: "critical",
    onHandle: () => setConfirming(true),
    dialog: confirming ? {
      type: "dialog", header: published ? "Delete article permanently" : "Delete draft permanently", onClose: () => { if (!busy) setConfirming(false); },
      content: <Box padding={4}><Stack space={4}><Text>{published ? "Both the published article and any unpublished changes will be removed. Unpublish instead unless permanent removal is required." : "This draft will be permanently removed. This cannot be undone."}</Text>{error && <Card padding={3} tone="critical"><Text role="alert">{error}</Text></Card>}<Flex gap={3} justify="flex-end"><Button disabled={busy} mode="bleed" text="Cancel" onClick={() => setConfirming(false)} /><Button disabled={busy} tone="critical" text={busy ? "Deleting…" : published ? "Delete article permanently" : "Delete draft permanently"} onClick={async () => { try { setBusy(true); setError(""); await deleteVariants(client, props.id.replace(/^drafts\./, "")); props.onComplete(); } catch { setError("Cannot delete until references are resolved."); } finally { setBusy(false); } }} /></Flex></Stack></Box>,
    } : undefined,
    title: error || undefined,
  };
};
