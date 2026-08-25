import type { AssetSettings, CustomSvg } from "./types";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const gradientPoints = (angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  const x = Math.cos(radians);
  const y = Math.sin(radians);
  return {
    x1: `${50 - x * 50}%`,
    y1: `${50 - y * 50}%`,
    x2: `${50 + x * 50}%`,
    y2: `${50 + y * 50}%`,
  };
};

const customIconMarkup = (customSvg: CustomSvg, settings: AssetSettings, paint: string) => {
  const [viewX = "0", viewY = "0", viewWidth = "24", viewHeight = "24"] =
    customSvg.viewBox.split(/\s+/);
  const sourceX = Number(viewX) || 0;
  const sourceY = Number(viewY) || 0;
  const sourceWidth = Number(viewWidth) || 24;
  const sourceHeight = Number(viewHeight) || 24;
  const scale = settings.iconSize / Math.max(sourceWidth, sourceHeight);
  const x = settings.iconX - (sourceWidth * scale) / 2 - sourceX * scale;
  const y = settings.iconY - (sourceHeight * scale) / 2 - sourceY * scale;

  const content = customSvg.content.replaceAll("currentColor", paint);
  return `<g transform="translate(${x} ${y}) scale(${scale})" color="${settings.iconColor}">${content}</g>`;
};

export const createAssetSvg = (settings: AssetSettings) => {
  const points = gradientPoints(settings.angle);
  const definitions = `<defs><linearGradient id="background" x1="${points.x1}" y1="${points.y1}" x2="${points.x2}" y2="${points.y2}"><stop offset="0%" stop-color="${settings.startColor}"/><stop offset="100%" stop-color="${settings.endColor}"/></linearGradient><linearGradient id="icon-gradient" x1="${points.x1}" y1="${points.y1}" x2="${points.x2}" y2="${points.y2}"><stop offset="0%" stop-color="${settings.startColor}"/><stop offset="75%" stop-color="${settings.endColor}"/></linearGradient></defs>`;
  const background =
    settings.mode === "blue-icon"
      ? ""
      : `<rect width="100%" height="100%" fill="url(#background)"/>`;
  const iconPaint = settings.mode === "blue-icon" ? "url(#icon-gradient)" : settings.iconColor;

  const icon =
    settings.iconSource === "custom" && settings.customSvg
      ? customIconMarkup(settings.customSvg, settings, iconPaint)
      : `<text x="${settings.iconX}" y="${settings.iconY}" fill="${iconPaint}" font-family="Segoe Fluent Icons" font-size="${settings.iconSize}" text-anchor="middle" dominant-baseline="central">&#x${settings.glyph.codepoint};</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${settings.width}" height="${settings.height}" viewBox="0 0 ${settings.width} ${settings.height}" role="img" aria-label="${escapeXml(settings.title || settings.glyph.name)}">${definitions}${background}${icon}</svg>`;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "windows-dev-asset";

export const assetFilename = (settings: AssetSettings, extension: "svg" | "png" | "webp") =>
  `${slugify(settings.title || settings.glyph.name)}.${extension}`;

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportSvg = (settings: AssetSettings) => {
  downloadBlob(
    new Blob([createAssetSvg(settings)], { type: "image/svg+xml;charset=utf-8" }),
    assetFilename(settings, "svg"),
  );
};

export const exportRaster = async (
  settings: AssetSettings,
  scale: number,
  format: "png" | "webp",
) => {
  await document.fonts.load(`${settings.iconSize}px "Segoe Fluent Icons"`);
  const svg = createAssetSvg(settings);
  const image = new Image();
  const source = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("The preview could not be rendered."));
    image.src = source;
  });

  const canvas = document.createElement("canvas");
  canvas.width = settings.width * scale;
  canvas.height = settings.height * scale;
  const context = canvas.getContext("2d");
  if (!context) {
    URL.revokeObjectURL(source);
    throw new Error("Canvas export is not available in this browser.");
  }

  context.scale(scale, scale);
  context.drawImage(image, 0, 0, settings.width, settings.height);
  URL.revokeObjectURL(source);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error(`${format.toUpperCase()} export failed.`))),
      `image/${format}`,
      format === "webp" ? 0.9 : undefined,
    );
  });
  downloadBlob(blob, assetFilename(settings, format));
};
