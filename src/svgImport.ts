import type { CustomSvg } from "./types";

const allowedElements = new Set([
  "circle",
  "clippath",
  "defs",
  "desc",
  "ellipse",
  "g",
  "lineargradient",
  "line",
  "mask",
  "path",
  "polygon",
  "polyline",
  "radialgradient",
  "rect",
  "stop",
  "symbol",
  "title",
  "use",
]);

const allowedAttributes = new Set([
  "clip-path",
  "clip-rule",
  "cx",
  "cy",
  "d",
  "fill",
  "fill-opacity",
  "fill-rule",
  "gradienttransform",
  "gradientunits",
  "height",
  "href",
  "id",
  "mask",
  "offset",
  "opacity",
  "pathlength",
  "points",
  "preserveaspectratio",
  "r",
  "refx",
  "refy",
  "rx",
  "ry",
  "spreadmethod",
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "transform",
  "viewbox",
  "width",
  "x",
  "x1",
  "x2",
  "y",
  "y1",
  "y2",
]);

const localUrlPattern = /^url\(\s*["']?#[A-Za-z_][\w:.-]*["']?\s*\)$/;
const localReferencePattern = /^#[A-Za-z_][\w:.-]*$/;

const normalizePaint = (value: string | null) => {
  if (!value) return null;
  const normalized = value.trim();
  if (normalized === "none" || normalized === "currentColor") return normalized;
  if (localUrlPattern.test(normalized)) return normalized;
  return "currentColor";
};

export const importSvg = async (file: File): Promise<CustomSvg> => {
  const source = await file.text();
  const documentNode = new DOMParser().parseFromString(source, "image/svg+xml");
  const parserError = documentNode.querySelector("parsererror");
  const root = documentNode.documentElement;

  if (parserError || root.tagName.toLowerCase() !== "svg") {
    throw new Error("Choose a valid SVG file.");
  }

  root.querySelectorAll("*").forEach((node) => {
    if (!allowedElements.has(node.tagName.toLowerCase())) {
      node.remove();
      return;
    }

    for (const attribute of [...node.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();

      if (name === "xlink:href") {
        if (localReferencePattern.test(value)) node.setAttribute("href", value);
        node.removeAttribute(attribute.name);
        continue;
      }

      if (!allowedAttributes.has(name)) {
        node.removeAttribute(attribute.name);
        continue;
      }

      if (name === "href" && !localReferencePattern.test(value)) {
        node.removeAttribute(attribute.name);
        continue;
      }

      if (value.includes("url(") && !localUrlPattern.test(value)) {
        node.removeAttribute(attribute.name);
      }
    }

    const fill = normalizePaint(node.getAttribute("fill"));
    const stroke = normalizePaint(node.getAttribute("stroke"));
    if (fill) node.setAttribute("fill", fill);
    if (stroke) node.setAttribute("stroke", stroke);
  });

  const viewBox =
    root.getAttribute("viewBox") ||
    `0 0 ${Number.parseFloat(root.getAttribute("width") || "24")} ${Number.parseFloat(root.getAttribute("height") || "24")}`;

  return {
    name: file.name.replace(/\.svg$/i, ""),
    content: `<g fill="${normalizePaint(root.getAttribute("fill")) || "currentColor"}"${
      root.hasAttribute("stroke")
        ? ` stroke="${normalizePaint(root.getAttribute("stroke")) || "currentColor"}"`
        : ""
    }>${root.innerHTML}</g>`,
    viewBox,
  };
};
