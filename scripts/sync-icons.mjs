import { mkdir, writeFile } from "node:fs/promises";

const source =
  "https://raw.githubusercontent.com/MicrosoftDocs/windows-dev-docs/docs/hub/apps/design/iconography/segoe-fluent-icons-font.md";

const response = await fetch(source);
if (!response.ok) {
  throw new Error(`Unable to download the icon catalog (${response.status}).`);
}

const markdown = await response.text();
const icons = [];
const seen = new Set();
const rowPattern = /^\|[^|]*\|\s*([eEfF][0-9a-fA-F]{3})\s*\|\s*([^|]+?)\s*\|/gm;

for (const match of markdown.matchAll(rowPattern)) {
  const codepoint = match[1].toUpperCase();
  const rawName = match[2].replaceAll("**", "").replaceAll("`", "").trim();
  const noLocName = rawName.match(/text=(?:"([^"]+)"|'([^']+)')/);
  const name = (noLocName?.[1] || noLocName?.[2] || rawName)
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .trim();
  const key = `${codepoint}:${name}`;
  if (!seen.has(key)) {
    seen.add(key);
    icons.push({ codepoint, name });
  }
}

if (icons.length < 500) {
  throw new Error(`Expected at least 500 icons, but parsed ${icons.length}.`);
}

icons.sort((a, b) => a.name.localeCompare(b.name));
await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../src/data/segoe-fluent-icons.json", import.meta.url),
  `${JSON.stringify(icons, null, 2)}\n`,
);

console.log(`Wrote ${icons.length} Segoe Fluent Icons.`);
