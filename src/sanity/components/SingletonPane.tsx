"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Box, Button, Card, Dialog, Flex, Stack, Text } from "@sanity/ui";
import { createDraftId } from "@sanity/id-utils";
import { useClient } from "sanity";
import { IntentLink, useRouter } from "sanity/router";
import { CURRENT_PAGE_QUERY, exactCurrentPageVersions, type CurrentPageVersion } from "../pageExistence";
import { SANITY_STUDIO_API_VERSION } from "../studio-target";

export type SingletonPaneOptions = {
  documentId: string;
  schemaType: string;
  title: string;
  initialValue: Record<string, unknown>;
};

type LoadedVersions = { documentId: string; versions: CurrentPageVersion[] };

export function SingletonPane({ options }: { options?: Partial<SingletonPaneOptions> }) {
  const documentId = options?.documentId ?? "";
  const schemaType = options?.schemaType ?? "";
  const title = options?.title ?? "Singleton";
  const initialValue = options?.initialValue ?? {};
  const studioClient = useClient({ apiVersion: SANITY_STUDIO_API_VERSION });
  const client = useMemo(() => studioClient.withConfig({ perspective: "raw", useCdn: false }), [studioClient]);
  const router = useRouter();
  const [loaded, setLoaded] = useState<LoadedVersions | null>(null);
  const [error, setError] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const [creating, setCreating] = useState(false);
  const requestGeneration = useRef(0);

  const fetchCurrentVersions = useCallback(async () => {
    const raw = await client.fetch<unknown>(CURRENT_PAGE_QUERY, {
      publishedId: documentId,
      draftId: `drafts.${documentId}`,
      schemaType,
    }, { cache: "no-store", perspective: "raw", tag: "singleton-existence" });
    const versions = exactCurrentPageVersions(raw, documentId, schemaType);
    const config = client.config();
    if (process.env.NODE_ENV !== "production") {
      console.info("Fixed page existence response", {
        requested: { documentId, draftId: `drafts.${documentId}`, schemaType },
        returned: Array.isArray(raw) ? raw.map((item) => item && typeof item === "object" ? { _id: (item as Partial<CurrentPageVersion>)._id, _type: (item as Partial<CurrentPageVersion>)._type } : item) : raw,
        accepted: versions.map(({ _id, _type }) => ({ _id, _type })),
        client: { projectId: config.projectId, dataset: config.dataset, apiVersion: SANITY_STUDIO_API_VERSION, perspective: "raw", useCdn: false },
      });
    }
    return versions;
  }, [client, documentId, schemaType]);

  const load = useCallback(() => {
    if (!documentId) return;
    const generation = ++requestGeneration.current;
    setError(undefined);
    fetchCurrentVersions()
      .then((versions) => { if (generation === requestGeneration.current) setLoaded({ documentId, versions }); })
      .catch((reason) => {
        console.error("Singleton existence query failed", reason);
        if (generation === requestGeneration.current) setError("The fixed page state could not be checked.");
      });
  }, [documentId, fetchCurrentVersions]);

  useEffect(() => {
    if (!documentId) return;
    const generation = ++requestGeneration.current;
    let active = true;
    fetchCurrentVersions()
      .then((versions) => { if (active && generation === requestGeneration.current) setLoaded({ documentId, versions }); })
      .catch((reason) => {
        console.error("Singleton existence query failed", reason);
        if (active && generation === requestGeneration.current) setError("The fixed page state could not be checked.");
      });
    return () => { active = false; };
  }, [documentId, fetchCurrentVersions]);

  const initializeClean = async () => {
    setCreating(true);
    setError(undefined);
    try {
      const draftId = createDraftId(documentId);
      await client.action({
        actionType: "sanity.action.document.create",
        publishedId: documentId,
        attributes: {
          ...initialValue,
          _id: draftId,
          _type: schemaType,
        },
        ifExists: "fail",
      }, {
        tag: "singleton-initialize",
      });
      const versions = await fetchCurrentVersions();
      const persisted = versions.find((version) => version._id === draftId && version._type === schemaType);
      if (!persisted) {
        throw new Error("The Document Actions API completed, but the exact raw existence query did not return the new draft.");
      }
      setLoaded({ documentId, versions });
      setConfirming(false);
      router.navigateIntent("edit", { id: documentId, type: schemaType });
    } catch (reason) {
      console.error(`Clean ${schemaType} page initialization failed for ${documentId}.`, reason);
      setCreating(false);
      setError("The supported Sanity document-create action failed or the new draft could not be verified in current raw content. Check the browser console for the action error. No content was published or deleted.");
    }
  };

  if (!documentId || !schemaType) return <PaneMessage tone="critical">Page configuration is incomplete.</PaneMessage>;
  if (error) return <PaneMessage tone="critical">{error} <Button mode="ghost" onClick={load} text="Retry" /></PaneMessage>;
  if (!loaded || loaded.documentId !== documentId) return <PaneMessage>Checking {title}…</PaneMessage>;

  const versions = exactCurrentPageVersions(loaded.versions, documentId, schemaType);

  if (versions.length > 0) {
    return <PaneLayout title={title}>
      <Text>The current fixed page exists and is ready to edit.</Text>
      <Flex><Button as={IntentLink} intent="edit" params={{ id: documentId, type: schemaType }} text={`Open ${title}`} tone="primary" /></Flex>
    </PaneLayout>;
  }

  return <PaneLayout title={title}>
    <Card padding={4} radius={2} tone="caution"><Stack space={3}>
      <Text weight="semibold">No current draft or published version exists.</Text>
      <Text size={1}>This can mean the page has never been created, or that a previous draft was discarded or deleted. Sanity may still retain document history even when current-content queries return nothing.</Text>
    </Stack></Card>
    <Stack space={3}>
      <Text weight="semibold">Choose a recovery path</Text>
      <Text size={1}>Open revision history to inspect or restore Sanity&apos;s retained content. Restoring is never automatic.</Text>
      <Flex gap={3} wrap="wrap">
        <Button as={IntentLink} intent="edit" mode="ghost" params={{ id: documentId, type: schemaType }} text="Open revision history" />
        <Button onClick={() => setConfirming(true)} text={`Create clean ${title} draft`} tone="primary" />
      </Flex>
    </Stack>
    {confirming && <Dialog header={`Initialize clean ${title}?`} id={`initialize-${documentId}`} onClose={() => setConfirming(false)} width={1}>
      <Box padding={4}><Stack space={4}>
        <Text>This creates a new unpublished draft at <code>drafts.{documentId}</code>. It does not restore, publish, delete, or overwrite historical content.</Text>
        <Flex gap={3} justify="flex-end"><Button disabled={creating} mode="bleed" onClick={() => setConfirming(false)} text="Cancel" /><Button disabled={creating} loading={creating} onClick={initializeClean} text="Create clean draft" tone="primary" /></Flex>
      </Stack></Box>
    </Dialog>}
  </PaneLayout>;
}

function PaneLayout({ children, title }: { children: ReactNode; title: string }) {
  return <Box padding={5}><Stack space={5}><Text as="h1" size={4} weight="bold">{title}</Text>{children}</Stack></Box>;
}

function PaneMessage({ children, tone = "default" }: { children: ReactNode; tone?: "critical" | "default" }) {
  return <Flex align="center" height="fill" justify="center" padding={5}><Card padding={4} radius={2} tone={tone}><Flex align="center" gap={3}>{children}</Flex></Card></Flex>;
}
