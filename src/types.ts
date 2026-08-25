export type AssetMode = "gradient" | "blue-icon" | "banner";
export type IconSource = "font" | "custom";

export interface IconDefinition {
  codepoint: string;
  name: string;
}

export interface CustomSvg {
  name: string;
  content: string;
  viewBox: string;
}

export interface AssetSettings {
  mode: AssetMode;
  width: number;
  height: number;
  startColor: string;
  endColor: string;
  angle: number;
  iconColor: string;
  iconSize: number;
  iconX: number;
  iconY: number;
  glyph: IconDefinition;
  iconSource: IconSource;
  customSvg: CustomSvg | null;
  title: string;
}
