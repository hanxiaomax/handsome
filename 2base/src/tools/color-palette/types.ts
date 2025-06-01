// Color value interfaces
export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface HSLColor {
  h: number; // 0-360 degrees
  s: number; // 0-100 percentage
  l: number; // 0-100 percentage
}

export interface HSVColor {
  h: number; // 0-360 degrees
  s: number; // 0-100 percentage
  v: number; // 0-100 percentage
}

export interface CMYKColor {
  c: number; // 0-100 percentage
  m: number; // 0-100 percentage
  y: number; // 0-100 percentage
  k: number; // 0-100 percentage
}

export interface ColorValue {
  hex: string; // "#FF5733"
  rgb: RGBColor; // {r: 255, g: 87, b: 51}
  hsl: HSLColor; // {h: 9, s: 100, l: 60}
  hsv: HSVColor; // {h: 9, s: 80, v: 100}
  cmyk: CMYKColor; // {c: 0, m: 66, y: 80, k: 0}
  alpha: number; // 1.0 (0-1)
}

export interface ColorPalette {
  id: string;
  name: string;
  baseColor: ColorValue;
  tints: ColorValue[]; // Lighter variations
  shades: ColorValue[]; // Darker variations
  harmony?: ColorValue[]; // Complementary colors
  createdAt: Date;
}

export interface ContrastResult {
  ratio: number;
  level: "AA" | "AAA" | "fail";
  largeText: boolean;
  normalText: boolean;
}

export interface ColorHistory {
  colors: ColorValue[];
  maxSize: number;
}

export interface UserPreferences {
  defaultFormat: "hex" | "rgb" | "hsl" | "hsv" | "cmyk";
  showAlpha: boolean;
  paletteSize: number;
  autoGenerate: boolean;
  theme: "light" | "dark" | "system";
}

export interface ColorPaletteState {
  // Current color state
  currentColor: ColorValue;
  inputFormat: "hex" | "rgb" | "hsl" | "hsv" | "cmyk";

  // Generated content
  generatedPalette: ColorPalette | null;
  paletteSize: number;

  // User interaction
  isPickerOpen: boolean;
  selectedFormat: string;

  // History and preferences
  colorHistory: ColorHistory;
  userPreferences: UserPreferences;

  // UI state
  isLoading: boolean;
  error: string | null;
  activeTab: "picker" | "palette" | "harmony";
}

export type ColorAction =
  | { type: "SET_COLOR"; payload: ColorValue }
  | { type: "SET_FORMAT"; payload: string }
  | { type: "GENERATE_PALETTE"; payload: { size: number } }
  | { type: "ADD_TO_HISTORY"; payload: ColorValue }
  | { type: "SET_PREFERENCES"; payload: Partial<UserPreferences> }
  | { type: "SET_ERROR"; payload: string | null };

export type ColorFormat = "hex" | "rgb" | "hsl" | "hsv" | "cmyk";

export interface SearchFilters {
  format?: ColorFormat;
  brightness?: "light" | "dark" | "medium";
  saturation?: "high" | "low" | "medium";
}
