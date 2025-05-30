// Main exports for the color palette library
export { ColorPaletteEngine } from "./engine";

// Type exports
export type {
  ColorValue,
  RGBColor,
  HSLColor,
  HSVColor,
  CMYKColor,
  ColorPalette,
  ContrastResult,
  ColorHistory,
  UserPreferences,
  ColorPaletteState,
  ColorAction,
  ColorFormat,
  SearchFilters,
} from "./types";

// Conversion utility exports
export {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToCmyk,
  cmykToRgb,
  createColorValue,
  validateHex,
  validateRgb,
  validateHsl,
  validateHsv,
  validateCmyk,
  calculateContrastRatio,
  formatColorValue,
} from "./conversions";

// Generator utility exports
export {
  generateTints,
  generateShades,
  generateComplementary,
  generateAnalogous,
  generateTriadic,
  generateSplitComplementary,
  generateTetradic,
  generateMonochromatic,
  generateColorPalette,
  generateRandomColor,
  generateWebSafeColors,
  generateMaterialColors,
  generateLightnessVariations,
  generateSaturationVariations,
} from "./generators";
