import type { Metadata } from "next";
import { NextStudio, metadata as studioMetadata, viewport } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { getSanityEnvironment } from "@/sanity/env";
import { StudioSetup } from "@/sanity/studio-setup";

export const dynamic = "force-static";

export const metadata: Metadata = {
  ...studioMetadata,
  title: "Sidwell Business Review Studio",
};

export { viewport };

export default function StudioPage() {
  const environment = getSanityEnvironment();

  if (!environment.configured) {
    return <StudioSetup />;
  }

  return <NextStudio config={config} />;
}
