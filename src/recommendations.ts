import type { IconDefinition } from "./types";

const aliases: Record<string, string[]> = {
  app: ["app", "window", "tile", "allapps"],
  code: ["code", "developer", "command", "console", "script", "terminal"],
  design: ["design", "color", "edit", "brush", "font", "ruler"],
  device: ["device", "desktop", "laptop", "mobile", "phone", "screen"],
  package: ["package", "box", "archive", "download", "store"],
  performance: ["speed", "performance", "analytics", "chart", "dashboard"],
  security: ["security", "shield", "lock", "privacy", "key"],
  settings: ["settings", "gear", "tools", "repair"],
  web: ["web", "globe", "world", "browser", "link"],
};

const normalize = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const searchIcons = (icons: IconDefinition[], query: string) => {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return icons;

  return icons
    .map((icon) => {
      const name = normalize(icon.name);
      const score = terms.reduce((total, term) => {
        if (name === term) return total + 8;
        if (name.startsWith(term)) return total + 5;
        if (name.includes(term)) return total + 3;
        return total;
      }, 0);
      return { icon, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.icon.name.localeCompare(b.icon.name))
    .map(({ icon }) => icon);
};

export const recommendIcons = (icons: IconDefinition[], title: string) => {
  const titleTerms = normalize(title).split(/\s+/).filter(Boolean);
  const expanded = new Set(titleTerms);

  for (const term of titleTerms) {
    for (const [topic, values] of Object.entries(aliases)) {
      if (term.includes(topic) || values.some((value) => term.includes(value))) {
        values.forEach((value) => expanded.add(value));
      }
    }
  }

  const query = [...expanded].join(" ");
  const matches = searchIcons(icons, query);
  return matches.slice(0, 8);
};
