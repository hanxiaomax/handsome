import type {
  ColorValue,
  ColorPalette,
  ContrastResult,
  ColorHistory,
  UserPreferences,
} from "./types";
import {
  createColorValue,
  calculateContrastRatio,
  formatColorValue,
  validateHex,
  validateRgb,
  validateHsl,
  validateHsv,
  validateCmyk,
} from "./conversions";
import {
  generateColorPalette,
  generateRandomColor,
  generateTints,
  generateShades,
  generateComplementary,
  generateAnalogous,
  generateTriadic,
} from "./generators";

export class ColorPaletteEngine {
  private colorHistory: ColorHistory;
  private userPreferences: UserPreferences;
  private storageKey = "color-palette-data";

  constructor() {
    this.colorHistory = { colors: [], maxSize: 50 };
    this.userPreferences = {
      defaultFormat: "hex",
      showAlpha: false,
      paletteSize: 10,
      autoGenerate: true,
      theme: "system",
    };
    this.loadFromStorage();
  }

  // Storage management
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.colorHistory) {
          this.colorHistory = { ...this.colorHistory, ...data.colorHistory };
        }
        if (data.userPreferences) {
          this.userPreferences = {
            ...this.userPreferences,
            ...data.userPreferences,
          };
        }
      }
    } catch (error) {
      console.warn("Failed to load color palette data from storage:", error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        colorHistory: this.colorHistory,
        userPreferences: this.userPreferences,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save color palette data to storage:", error);
    }
  }

  // Color creation and validation
  createColor(
    input:
      | string
      | { r: number; g: number; b: number }
      | { h: number; s: number; l: number }
      | { h: number; s: number; v: number }
      | { c: number; m: number; y: number; k: number },
    alpha: number = 1
  ): ColorValue {
    try {
      return createColorValue(input, alpha);
    } catch (error) {
      throw new Error(
        `Invalid color input: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Validation methods
  validateColorInput(
    format: string,
    value: string
  ): { isValid: boolean; error?: string } {
    try {
      switch (format.toLowerCase()) {
        case "hex": {
          if (!validateHex(value)) {
            return {
              isValid: false,
              error: "Invalid HEX format. Use #RRGGBB or #RGB",
            };
          }
          break;
        }
        case "rgb": {
          const rgbMatch = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (!rgbMatch) {
            return {
              isValid: false,
              error: "Invalid RGB format. Use rgb(255, 255, 255)",
            };
          }
          const [, r, g, b] = rgbMatch.map(Number);
          if (!validateRgb(r, g, b)) {
            return {
              isValid: false,
              error: "RGB values must be between 0-255",
            };
          }
          break;
        }
        case "hsl": {
          const hslMatch = value.match(/hsl\((\d+)°?,\s*(\d+)%?,\s*(\d+)%?\)/);
          if (!hslMatch) {
            return {
              isValid: false,
              error: "Invalid HSL format. Use hsl(360°, 100%, 50%)",
            };
          }
          const [, h, s, l] = hslMatch.map(Number);
          if (!validateHsl(h, s, l)) {
            return {
              isValid: false,
              error: "HSL values: H(0-360°), S(0-100%), L(0-100%)",
            };
          }
          break;
        }
        case "hsv": {
          const hsvMatch = value.match(/hsv\((\d+)°?,\s*(\d+)%?,\s*(\d+)%?\)/);
          if (!hsvMatch) {
            return {
              isValid: false,
              error: "Invalid HSV format. Use hsv(360°, 100%, 100%)",
            };
          }
          const [, hv, sv, vv] = hsvMatch.map(Number);
          if (!validateHsv(hv, sv, vv)) {
            return {
              isValid: false,
              error: "HSV values: H(0-360°), S(0-100%), V(0-100%)",
            };
          }
          break;
        }
        case "cmyk": {
          const cmykMatch = value.match(
            /cmyk\((\d+)%?,\s*(\d+)%?,\s*(\d+)%?\)/
          );
          if (!cmykMatch) {
            return {
              isValid: false,
              error: "Invalid CMYK format. Use cmyk(0%, 0%, 0%, 0%)",
            };
          }
          const [, c, m, y, k] = cmykMatch.map(Number);
          if (!validateCmyk(c, m, y, k)) {
            return {
              isValid: false,
              error: "CMYK values must be between 0-100%",
            };
          }
          break;
        }
        default:
          return { isValid: false, error: "Unsupported color format" };
      }
      return { isValid: true };
    } catch {
      return { isValid: false, error: "Invalid color format" };
    }
  }

  // Color history management
  addToHistory(color: ColorValue): void {
    // Remove if already exists
    this.colorHistory.colors = this.colorHistory.colors.filter(
      (c) => c.hex !== color.hex
    );

    // Add to beginning
    this.colorHistory.colors.unshift(color);

    // Limit size
    if (this.colorHistory.colors.length > this.colorHistory.maxSize) {
      this.colorHistory.colors = this.colorHistory.colors.slice(
        0,
        this.colorHistory.maxSize
      );
    }

    this.saveToStorage();
  }

  getColorHistory(): ColorValue[] {
    return [...this.colorHistory.colors];
  }

  clearHistory(): void {
    this.colorHistory.colors = [];
    this.saveToStorage();
  }

  // Palette generation
  generatePalette(
    baseColor: ColorValue,
    options: {
      tintsCount?: number;
      shadesCount?: number;
      includeHarmony?: boolean;
      harmonyType?:
        | "complementary"
        | "analogous"
        | "triadic"
        | "split-complementary"
        | "tetradic"
        | "monochromatic";
    } = {}
  ): ColorPalette {
    const palette = generateColorPalette(baseColor, options);
    this.addToHistory(baseColor);
    return palette;
  }

  generateRandomColor(): ColorValue {
    const color = generateRandomColor();
    this.addToHistory(color);
    return color;
  }

  // Color utilities
  formatColor(
    color: ColorValue,
    format: "hex" | "rgb" | "hsl" | "hsv" | "cmyk"
  ): string {
    return formatColorValue(color, format);
  }

  // Contrast checking
  checkContrast(
    foreground: ColorValue,
    background: ColorValue
  ): ContrastResult {
    const ratio = calculateContrastRatio(foreground, background);

    const result: ContrastResult = {
      ratio: Math.round(ratio * 100) / 100,
      level: "fail",
      largeText: false,
      normalText: false,
    };

    // WCAG AA standards
    if (ratio >= 7) {
      result.level = "AAA";
      result.largeText = true;
      result.normalText = true;
    } else if (ratio >= 4.5) {
      result.level = "AA";
      result.largeText = true;
      result.normalText = true;
    } else if (ratio >= 3) {
      result.level = "AA";
      result.largeText = true;
      result.normalText = false;
    }

    return result;
  }

  // Clipboard operations
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  }

  // Preference management
  getUserPreferences(): UserPreferences {
    return { ...this.userPreferences };
  }

  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    this.saveToStorage();
  }

  // Color analysis
  analyzeColor(color: ColorValue): {
    brightness: "light" | "medium" | "dark";
    saturation: "low" | "medium" | "high";
    temperature: "warm" | "cool" | "neutral";
    accessibility: {
      onWhite: ContrastResult;
      onBlack: ContrastResult;
    };
  } {
    const white = createColorValue("#FFFFFF");
    const black = createColorValue("#000000");

    const brightness =
      color.hsl.l > 70 ? "light" : color.hsl.l > 30 ? "medium" : "dark";
    const saturation =
      color.hsl.s > 70 ? "high" : color.hsl.s > 30 ? "medium" : "low";

    let temperature: "warm" | "cool" | "neutral" = "neutral";
    const hue = color.hsl.h;
    if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) {
      temperature = "warm"; // Red, orange, yellow, magenta
    } else if (hue >= 120 && hue <= 240) {
      temperature = "cool"; // Green, cyan, blue
    }

    return {
      brightness,
      saturation,
      temperature,
      accessibility: {
        onWhite: this.checkContrast(color, white),
        onBlack: this.checkContrast(color, black),
      },
    };
  }

  // Quick palette generators
  generateTints(color: ColorValue, count: number = 5): ColorValue[] {
    return generateTints(color, count);
  }

  generateShades(color: ColorValue, count: number = 5): ColorValue[] {
    return generateShades(color, count);
  }

  generateComplementary(color: ColorValue): ColorValue {
    return generateComplementary(color);
  }

  generateAnalogous(color: ColorValue, count: number = 4): ColorValue[] {
    return generateAnalogous(color, count);
  }

  generateTriadic(color: ColorValue): ColorValue[] {
    return generateTriadic(color);
  }

  // Export functionality
  exportPalette(
    palette: ColorPalette,
    format: "json" | "css" | "scss" | "ase"
  ): string {
    switch (format) {
      case "json":
        return JSON.stringify(palette, null, 2);

      case "css": {
        let css = ":root {\n";
        css += `  --color-base: ${palette.baseColor.hex};\n`;
        palette.tints.forEach((tint, i) => {
          css += `  --color-tint-${i + 1}: ${tint.hex};\n`;
        });
        palette.shades.forEach((shade, i) => {
          css += `  --color-shade-${i + 1}: ${shade.hex};\n`;
        });
        if (palette.harmony) {
          palette.harmony.forEach((color, i) => {
            css += `  --color-harmony-${i + 1}: ${color.hex};\n`;
          });
        }
        css += "}";
        return css;
      }

      case "scss": {
        let scss = "";
        scss += `$color-base: ${palette.baseColor.hex};\n`;
        palette.tints.forEach((tint, i) => {
          scss += `$color-tint-${i + 1}: ${tint.hex};\n`;
        });
        palette.shades.forEach((shade, i) => {
          scss += `$color-shade-${i + 1}: ${shade.hex};\n`;
        });
        if (palette.harmony) {
          palette.harmony.forEach((color, i) => {
            scss += `$color-harmony-${i + 1}: ${color.hex};\n`;
          });
        }
        return scss;
      }

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Import functionality
  importPalette(data: string, format: "json"): ColorPalette {
    try {
      switch (format) {
        case "json": {
          const parsed = JSON.parse(data);
          // Validate the structure
          if (!parsed.baseColor || !parsed.tints || !parsed.shades) {
            throw new Error("Invalid palette structure");
          }
          return parsed as ColorPalette;
        }

        default:
          throw new Error(`Unsupported import format: ${format}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to import palette: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
