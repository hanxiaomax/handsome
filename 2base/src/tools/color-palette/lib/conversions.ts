import type {
  RGBColor,
  HSLColor,
  HSVColor,
  CMYKColor,
  ColorValue,
} from "./types";

// Utility functions for clamping values
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const round = (value: number, decimals: number = 0): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// HEX to RGB conversion
export const hexToRgb = (hex: string): RGBColor | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// RGB to HEX conversion
export const rgbToHex = (rgb: RGBColor): string => {
  const toHex = (c: number): string => {
    const hex = Math.round(clamp(c, 0, 255)).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};

// RGB to HSL conversion
export const rgbToHsl = (rgb: RGBColor): HSLColor => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  return {
    h: round(h * 360),
    s: round(s * 100),
    l: round(l * 100),
  };
};

// HSL to RGB conversion
export const hslToRgb = (hsl: HSLColor): RGBColor => {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// RGB to HSV conversion
export const rgbToHsv = (rgb: RGBColor): HSVColor => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  return {
    h: round(h * 360),
    s: round(s * 100),
    v: round(v * 100),
  };
};

// HSV to RGB conversion
export const hsvToRgb = (hsv: HSVColor): RGBColor => {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r: number, g: number, b: number;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = g = b = 0;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// RGB to CMYK conversion
export const rgbToCmyk = (rgb: RGBColor): CMYKColor => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, Math.max(g, b));

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: round(c * 100),
    m: round(m * 100),
    y: round(y * 100),
    k: round(k * 100),
  };
};

// CMYK to RGB conversion
export const cmykToRgb = (cmyk: CMYKColor): RGBColor => {
  const c = cmyk.c / 100;
  const m = cmyk.m / 100;
  const y = cmyk.y / 100;
  const k = cmyk.k / 100;

  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  };
};

// Create a complete ColorValue from any format
export const createColorValue = (
  input: string | RGBColor | HSLColor | HSVColor | CMYKColor,
  alpha: number = 1
): ColorValue => {
  let rgb: RGBColor;

  if (typeof input === "string") {
    // HEX input
    const hexResult = hexToRgb(input);
    if (!hexResult) {
      throw new Error("Invalid HEX color format");
    }
    rgb = hexResult;
  } else if ("r" in input) {
    // RGB input
    rgb = input;
  } else if ("h" in input && "s" in input && "l" in input) {
    // HSL input
    rgb = hslToRgb(input);
  } else if ("h" in input && "s" in input && "v" in input) {
    // HSV input
    rgb = hsvToRgb(input);
  } else if ("c" in input) {
    // CMYK input
    rgb = cmykToRgb(input);
  } else {
    throw new Error("Invalid color input format");
  }

  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);
  const cmyk = rgbToCmyk(rgb);

  return {
    hex,
    rgb,
    hsl,
    hsv,
    cmyk,
    alpha: clamp(alpha, 0, 1),
  };
};

// Validate color format inputs
export const validateHex = (hex: string): boolean => {
  return /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex);
};

export const validateRgb = (r: number, g: number, b: number): boolean => {
  return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
};

export const validateHsl = (h: number, s: number, l: number): boolean => {
  return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;
};

export const validateHsv = (h: number, s: number, v: number): boolean => {
  return h >= 0 && h <= 360 && s >= 0 && s <= 100 && v >= 0 && v <= 100;
};

export const validateCmyk = (
  c: number,
  m: number,
  y: number,
  k: number
): boolean => {
  return (
    c >= 0 &&
    c <= 100 &&
    m >= 0 &&
    m <= 100 &&
    y >= 0 &&
    y <= 100 &&
    k >= 0 &&
    k <= 100
  );
};

// Calculate color contrast ratio (WCAG)
export const calculateContrastRatio = (
  color1: ColorValue,
  color2: ColorValue
): number => {
  const getLuminance = (rgb: RGBColor): number => {
    const toLinear = (c: number): number => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const r = toLinear(rgb.r);
    const g = toLinear(rgb.g);
    const b = toLinear(rgb.b);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1.rgb);
  const lum2 = getLuminance(color2.rgb);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

// Format color values for display
export const formatColorValue = (
  color: ColorValue,
  format: "hex" | "rgb" | "hsl" | "hsv" | "cmyk"
): string => {
  switch (format) {
    case "hex":
      return color.hex.toUpperCase();
    case "rgb":
      return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    case "hsl":
      return `hsl(${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%)`;
    case "hsv":
      return `hsv(${color.hsv.h}°, ${color.hsv.s}%, ${color.hsv.v}%)`;
    case "cmyk":
      return `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`;
    default:
      return color.hex;
  }
};
