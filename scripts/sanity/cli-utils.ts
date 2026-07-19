import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export function applying(): boolean { return process.argv.includes("--apply"); }

export async function writeReport(kind: string, value: unknown): Promise<string> {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const directory = path.resolve(".sanity-reports");
  await mkdir(directory, { recursive: true });
  const output = path.join(directory, `${kind}-${stamp}.json`);
  await writeFile(output, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return output;
}

export function assertExpectedTarget(actualProject: string, actualDataset: string) {
  const project = argument("--expect-project");
  const dataset = argument("--expect-dataset");
  if (project !== actualProject || dataset !== actualDataset) throw new Error("Refusing to apply: --expect-project and --expect-dataset must exactly match the connected target.");
}

export async function assertRecentExport() {
  const exportPath = argument("--export-confirmed");
  if (!exportPath) throw new Error("Refusing to apply without --export-confirmed <path-to-recent-export>.");
  const details = await stat(exportPath);
  if (Date.now() - details.mtimeMs > 24 * 60 * 60 * 1000) throw new Error("Refusing to apply: the confirmed export is more than 24 hours old.");
}
