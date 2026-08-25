import { useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Clipboard,
  Download,
  Image,
  Moon,
  RefreshCcw,
  Search,
  Sparkles,
  Sun,
  Upload,
} from "lucide-react";
import iconCatalog from "./data/segoe-fluent-icons.json";
import { createAssetSvg, exportPng, exportSvg } from "./asset";
import { recommendIcons, searchIcons } from "./recommendations";
import { importSvg } from "./svgImport";
import type { AssetMode, AssetSettings, IconDefinition } from "./types";

const icons = iconCatalog as IconDefinition[];

const presets: Array<{
  id: AssetMode;
  label: string;
  description: string;
  width: number;
  height: number;
  startColor: string;
  endColor: string;
  iconColor: string;
  iconSize: number;
  angle: number;
}> = [
  {
    id: "gradient",
    label: "Overview tile",
    description: "Current pastel tile with a center plate",
    width: 539,
    height: 303,
    startColor: "#94B6D0",
    endColor: "#AEC9DE",
    iconColor: "#2B699E",
    iconSize: 92,
    angle: 135,
  },
  {
    id: "blue-icon",
    label: "Blue icon",
    description: "Transparent reusable SVG icon",
    width: 48,
    height: 48,
    startColor: "#4DD2FF",
    endColor: "#0078D4",
    iconColor: "#0078D4",
    iconSize: 40,
    angle: 147,
  },
  {
    id: "banner",
    label: "Blog header",
    description: "Current 16:9 decorative header",
    width: 1600,
    height: 900,
    startColor: "#0F6CBD",
    endColor: "#7F85F5",
    iconColor: "#FFFFFF",
    iconSize: 320,
    angle: 135,
  },
  {
    id: "social-card",
    label: "Social card",
    description: "Open Graph and sharing image",
    width: 1200,
    height: 628,
    startColor: "#0F6CBD",
    endColor: "#7F85F5",
    iconColor: "#FFFFFF",
    iconSize: 240,
    angle: 135,
  },
  {
    id: "wide-hero",
    label: "Wide blog hero",
    description: "Cinematic CLI announcement hero",
    width: 1440,
    height: 598,
    startColor: "#0F6CBD",
    endColor: "#7F85F5",
    iconColor: "#FFFFFF",
    iconSize: 260,
    angle: 135,
  },
];

const gradients = [
  ["Design", "#94B6D0", "#AEC9DE", "#2B699E"],
  ["Develop", "#65BFCB", "#82D3D9", "#138E9F"],
  ["Essentials", "#60AAD2", "#77B9DE", "#4F9AC3"],
  ["Package", "#A4B6A7", "#BACAB7", "#5C8058"],
  ["Publish", "#BBACC8", "#D3BFD7", "#AF6FC7"],
  ["Hub icons", "#4DD2FF", "#0078D4", "#0078D4"],
];

const initialGlyph =
  icons.find((icon) => icon.name === "DeveloperTools") ||
  icons.find((icon) => icon.name === "CommandPrompt") ||
  icons[0];

const initialSettings: AssetSettings = {
  mode: "gradient",
  width: 539,
  height: 303,
  startColor: "#94B6D0",
  endColor: "#AEC9DE",
  angle: 135,
  iconColor: "#2B699E",
  iconSize: 92,
  iconX: 269.5,
  iconY: 151.5,
  glyph: initialGlyph,
  iconSource: "font",
  customSvg: null,
  title: "Windows developer overview",
};

const NumberField = ({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) => (
  <label className="field">
    <span>{label}</span>
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </label>
);

function App() {
  const [settings, setSettings] = useState(initialSettings);
  const [query, setQuery] = useState("");
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [pngScale, setPngScale] = useState(2);
  const [exportFormat, setExportFormat] = useState<"svg" | "png">("svg");
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const [theme, setTheme] = useState(currentTheme);

  const visibleIcons = useMemo(
    () => (query ? searchIcons(icons, query) : recommendIcons(icons, settings.title)),
    [query, settings.title],
  );
  const displayedIcons = showAllIcons ? visibleIcons : visibleIcons.slice(0, 80);
  const selectedPreset = presets.find((preset) => preset.id === settings.mode)!;
  const svg = useMemo(() => createAssetSvg(settings), [settings]);

  const update = <K extends keyof AssetSettings>(key: K, value: AssetSettings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const choosePreset = (mode: AssetMode) => {
    const preset = presets.find((item) => item.id === mode)!;
    setSettings((current) => ({
      ...current,
      mode,
      width: preset.width,
      height: preset.height,
      startColor: preset.startColor,
      endColor: preset.endColor,
      iconColor: preset.iconColor,
      iconSize: preset.iconSize,
      angle: preset.angle,
      iconX: preset.width / 2,
      iconY: preset.height / 2,
    }));
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const customSvg = await importSvg(file);
      setSettings((current) => ({
        ...current,
        customSvg,
        iconSource: "custom",
        title: current.title || customSvg.name,
      }));
      setNotice(`Imported ${file.name}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "SVG import failed.");
    }
  };

  const copySvg = async () => {
    await navigator.clipboard.writeText(svg);
    setNotice("SVG copied to the clipboard.");
  };

  const reset = () => {
    setSettings(initialSettings);
    setQuery("");
    setNotice("Settings reset.");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Sparkles size={22} />
          </div>
          <div>
            <h1>Windows developer asset generator</h1>
            <p>Create documentation tiles, icons, and blog banners without opening Figma.</p>
          </div>
        </div>
        <div className="header-actions">
          <a href="https://github.com/niels9001/WinDevAssetGenerator" target="_blank" rel="noreferrer">
            View source
          </a>
          <button className="icon-button" onClick={toggleTheme} aria-label="Toggle color theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="workspace">
        <aside className="controls panel">
          <section>
            <div className="section-heading">
              <span className="step">1</span>
              <div>
                <h2>Format</h2>
                <p>Start from a reusable output preset.</p>
              </div>
            </div>
            <label className="select-field preset-select">
              <span>Asset preset</span>
              <select
                value={settings.mode}
                onChange={(event) => choosePreset(event.target.value as AssetMode)}
              >
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} · {preset.width} × {preset.height}
                  </option>
                ))}
              </select>
              <small>{selectedPreset.description}</small>
            </label>
            <div className="field-row">
              <NumberField
                label="Width"
                value={settings.width}
                min={16}
                max={4096}
                onChange={(width) =>
                  setSettings((current) => ({ ...current, width, iconX: width / 2 }))
                }
              />
              <NumberField
                label="Height"
                value={settings.height}
                min={16}
                max={4096}
                onChange={(height) =>
                  setSettings((current) => ({ ...current, height, iconY: height / 2 }))
                }
              />
            </div>
          </section>

          <section>
            <div className="section-heading compact">
              <span className="step">2</span>
              <div>
                <h2>{settings.mode === "blue-icon" ? "Icon gradient" : "Background"}</h2>
                <p>
                  {settings.mode === "blue-icon"
                    ? "Match the two-stop gradient used by the hub icon family."
                    : "Pick a pair or define your own gradient."}
                </p>
              </div>
            </div>
            <div className="gradient-grid">
              {gradients.map(([name, start, end, iconColor]) => (
                <button
                  key={name}
                  className="gradient-swatch"
                  title={name}
                  style={{ "--gradient-start": start, "--gradient-end": end } as React.CSSProperties}
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      startColor: start,
                      endColor: end,
                      iconColor: current.mode === "gradient" ? iconColor : current.iconColor,
                    }))
                  }
                >
                  <span />
                  <small>{name}</small>
                </button>
              ))}
            </div>
            <div className="field-row">
              <label className="color-field">
                <span>Start</span>
                <input
                  type="color"
                  value={settings.startColor}
                  onChange={(event) => update("startColor", event.target.value)}
                />
                <code>{settings.startColor.toUpperCase()}</code>
              </label>
              <label className="color-field">
                <span>End</span>
                <input
                  type="color"
                  value={settings.endColor}
                  onChange={(event) => update("endColor", event.target.value)}
                />
                <code>{settings.endColor.toUpperCase()}</code>
              </label>
            </div>
            <label className="range-field">
              <span>Angle <output>{settings.angle}°</output></span>
              <input
                type="range"
                min="0"
                max="360"
                value={settings.angle}
                onChange={(event) => update("angle", Number(event.target.value))}
              />
            </label>
          </section>

          <section>
            <div className="section-heading compact">
              <span className="step">3</span>
              <div>
                <h2>Icon</h2>
                <p>Use a font glyph or bring your own SVG.</p>
              </div>
            </div>
            <div className="source-switch" role="group" aria-label="Icon source">
              <button
                className={settings.iconSource === "font" ? "active" : ""}
                onClick={() => update("iconSource", "font")}
              >
                Segoe Fluent Icons
              </button>
              <button
                className={settings.iconSource === "custom" ? "active" : ""}
                onClick={() => fileInput.current?.click()}
              >
                <Upload size={15} />
                Import SVG
              </button>
              <input
                ref={fileInput}
                hidden
                type="file"
                accept=".svg,image/svg+xml"
                onChange={(event) => handleImport(event.target.files?.[0])}
              />
            </div>

            {settings.iconSource === "font" ? (
              <>
                <label className="search-field">
                  <Search size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search icons or use the recommendations"
                  />
                </label>
                {!query && (
                  <div className="recommendation-label">
                    <Sparkles size={14} />
                    Recommended for “{settings.title || "your asset"}”
                  </div>
                )}
                <div className="icon-grid">
                  {displayedIcons.map((icon) => (
                    <button
                      key={`${icon.codepoint}-${icon.name}`}
                      className={settings.glyph.codepoint === icon.codepoint ? "selected" : ""}
                      title={`${icon.name} · U+${icon.codepoint}`}
                      onClick={() => update("glyph", icon)}
                    >
                      <span className="segoe-icon">
                        {String.fromCodePoint(Number.parseInt(icon.codepoint, 16))}
                      </span>
                      <small>{icon.name}</small>
                    </button>
                  ))}
                </div>
                {visibleIcons.length > displayedIcons.length && (
                  <button className="show-more" onClick={() => setShowAllIcons((value) => !value)}>
                    {showAllIcons ? "Show fewer" : `Show all ${visibleIcons.length}`}
                    <ChevronDown size={16} />
                  </button>
                )}
              </>
            ) : (
              <div className="import-summary">
                <Image size={24} />
                <div>
                  <strong>{settings.customSvg?.name || "No SVG selected"}</strong>
                  <span>
                    {settings.customSvg
                      ? "Colors are normalized to the icon color."
                      : "Import an SVG to use it in the asset."}
                  </span>
                </div>
                <button onClick={() => fileInput.current?.click()}>Replace</button>
              </div>
            )}

            <div className="field-row">
              {settings.mode !== "blue-icon" && (
                <label className="color-field">
                  <span>Icon color</span>
                  <input
                    type="color"
                    value={settings.iconColor}
                    onChange={(event) => update("iconColor", event.target.value)}
                  />
                  <code>{settings.iconColor.toUpperCase()}</code>
                </label>
              )}
              <NumberField
                label="Size"
                value={settings.iconSize}
                min={8}
                max={2048}
                onChange={(value) => update("iconSize", value)}
              />
            </div>
            <div className="field-row">
              <NumberField
                label="Horizontal"
                value={settings.iconX}
                min={-settings.width}
                max={settings.width * 2}
                onChange={(value) => update("iconX", value)}
              />
              <NumberField
                label="Vertical"
                value={settings.iconY}
                min={-settings.height}
                max={settings.height * 2}
                onChange={(value) => update("iconY", value)}
              />
            </div>
          </section>
        </aside>

        <section className="preview-column">
          <div className="preview-toolbar">
            <div>
              <span className="eyebrow">Live preview</span>
              <strong>{settings.width} × {settings.height}px</strong>
            </div>
            <button className="secondary-button" onClick={reset}>
              <RefreshCcw size={16} />
              Reset
            </button>
          </div>
          <div className={`preview-stage ${settings.mode === "blue-icon" ? "checkerboard" : ""}`}>
            <div
              className="asset-preview"
              style={{ aspectRatio: `${settings.width} / ${settings.height}` }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
          <div className="asset-meta panel">
            <label className="title-field">
              <span>Asset name</span>
              <input
                value={settings.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Describe this asset"
              />
              <small>Used for icon recommendations, accessible text, and the filename.</small>
            </label>
            <div className="selection-summary">
              <span>Selected icon</span>
              <strong>
                {settings.iconSource === "font"
                  ? `${settings.glyph.name} · U+${settings.glyph.codepoint}`
                  : settings.customSvg?.name || "Custom SVG"}
              </strong>
            </div>
          </div>
        </section>

        <aside className="export-panel panel">
          <div className="section-heading">
            <span className="step">4</span>
            <div>
              <h2>Export</h2>
              <p>Download an editable vector or a portable bitmap.</p>
            </div>
          </div>

          <div className="export-card">
            <label className="select-field">
              <span>Format</span>
              <select
                value={exportFormat}
                onChange={(event) => setExportFormat(event.target.value as "svg" | "png")}
              >
                <option value="svg">SVG · scalable vector</option>
                <option value="png">PNG · portable bitmap</option>
              </select>
            </label>
            {exportFormat === "svg" ? (
              <>
                <div>
                  <strong>Scalable vector</strong>
                  <p>Best for documentation source and later edits.</p>
                </div>
                <button className="primary-button" onClick={() => exportSvg(settings)}>
                  <Download size={17} />
                  Download SVG
                </button>
                <button className="secondary-button" onClick={copySvg}>
                  <Clipboard size={17} />
                  Copy markup
                </button>
              </>
            ) : (
              <>
                <div>
                  <strong>Portable bitmap</strong>
                  <p>Rasterizes the glyph for consistent rendering everywhere.</p>
                </div>
                <label className="select-field">
                  <span>Export scale</span>
                  <select
                    value={pngScale}
                    onChange={(event) => setPngScale(Number(event.target.value))}
                  >
                    <option value="1">1× · {settings.width} × {settings.height}</option>
                    <option value="2">2× · {settings.width * 2} × {settings.height * 2}</option>
                    <option value="3">3× · {settings.width * 3} × {settings.height * 3}</option>
                  </select>
                </label>
                <button
                  className="primary-button"
                  onClick={() =>
                    exportPng(settings, pngScale).catch((error) =>
                      setNotice(error instanceof Error ? error.message : "PNG export failed."),
                    )
                  }
                >
                  <Download size={17} />
                  Download PNG
                </button>
              </>
            )}
          </div>

          {exportFormat === "svg" && (
            <div className="font-note">
              <strong>Font portability</strong>
              <p>
                Font-based SVG files reference Segoe Fluent Icons. Use PNG when the asset must render
                on systems without the font, or import an SVG for a path-based vector.
              </p>
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              <Check size={16} />
              {notice}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;
