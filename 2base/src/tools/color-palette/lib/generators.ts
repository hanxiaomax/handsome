import type { ColorValue, ColorPalette } from "./types";
import { createColorValue } from "./conversions";

// Generate tints (lighter variations) from a base color
export const generateTints = (
  baseColor: ColorValue,
  count: number = 10
): ColorValue[] => {
  const tints: ColorValue[] = [];
  const baseHsl = baseColor.hsl;

  for (let i = 1; i <= count; i++) {
    const lightness = Math.min(
      100,
      baseHsl.l + (i * (100 - baseHsl.l)) / count
    );
    const tintHsl = {
      h: baseHsl.h,
      s: Math.max(0, baseHsl.s - i * 5), // Slightly reduce saturation for lighter tints
      l: lightness,
    };
    tints.push(createColorValue(tintHsl));
  }

  return tints;
};

// Generate shades (darker variations) from a base color
export const generateShades = (
  baseColor: ColorValue,
  count: number = 10
): ColorValue[] => {
  const shades: ColorValue[] = [];
  const baseHsl = baseColor.hsl;

  for (let i = 1; i <= count; i++) {
    const lightness = Math.max(0, baseHsl.l - (i * baseHsl.l) / count);
    const shadeHsl = {
      h: baseHsl.h,
      s: Math.min(100, baseHsl.s + i * 2), // Slightly increase saturation for darker shades
      l: lightness,
    };
    shades.push(createColorValue(shadeHsl));
  }

  return shades;
};

// Generate complementary color (opposite on color wheel)
export const generateComplementary = (baseColor: ColorValue): ColorValue => {
  const complementaryHsl = {
    h: (baseColor.hsl.h + 180) % 360,
    s: baseColor.hsl.s,
    l: baseColor.hsl.l,
  };
  return createColorValue(complementaryHsl);
};

// Generate analogous colors (adjacent on color wheel)
export const generateAnalogous = (
  baseColor: ColorValue,
  count: number = 4
): ColorValue[] => {
  const analogous: ColorValue[] = [];
  const baseHsl = baseColor.hsl;
  const step = 30; // 30 degree steps

  for (let i = 1; i <= count; i++) {
    const leftHue = (baseHsl.h - i * step + 360) % 360;
    const rightHue = (baseHsl.h + i * step) % 360;

    analogous.push(
      createColorValue({
        h: leftHue,
        s: baseHsl.s,
        l: baseHsl.l,
      })
    );

    if (analogous.length < count) {
      analogous.push(
        createColorValue({
          h: rightHue,
          s: baseHsl.s,
          l: baseHsl.l,
        })
      );
    }
  }

  return analogous.slice(0, count);
};

// Generate triadic colors (120 degrees apart)
export const generateTriadic = (baseColor: ColorValue): ColorValue[] => {
  const baseHsl = baseColor.hsl;

  return [
    createColorValue({
      h: (baseHsl.h + 120) % 360,
      s: baseHsl.s,
      l: baseHsl.l,
    }),
    createColorValue({
      h: (baseHsl.h + 240) % 360,
      s: baseHsl.s,
      l: baseHsl.l,
    }),
  ];
};

// Generate split-complementary colors
export const generateSplitComplementary = (
  baseColor: ColorValue
): ColorValue[] => {
  const baseHsl = baseColor.hsl;
  const complementaryHue = (baseHsl.h + 180) % 360;

  return [
    createColorValue({
      h: (complementaryHue - 30 + 360) % 360,
      s: baseHsl.s,
      l: baseHsl.l,
    }),
    createColorValue({
      h: (complementaryHue + 30) % 360,
      s: baseHsl.s,
      l: baseHsl.l,
    }),
  ];
};

// Generate tetradic (square) colors
export const generateTetradic = (baseColor: ColorValue): ColorValue[] => {
  const baseHsl = baseColor.hsl;

  return [
    createColorValue({
      h: (baseHsl.h + 90) % 360,
      s: baseHsl.s,
      l: baseHsl.l,
    }),
    createColorValue({
      h: (baseHsl.h + 180) % 360,
      s: baseHsl.s,
      l: baseHsl.l,
    }),
    createColorValue({
      h: (baseHsl.h + 270) % 360,
      s: baseHsl.s,
      l: baseHsl.l,
    }),
  ];
};

// Generate monochromatic palette (same hue, different saturation/lightness)
export const generateMonochromatic = (
  baseColor: ColorValue,
  count: number = 8
): ColorValue[] => {
  const monochromatic: ColorValue[] = [];
  const baseHsl = baseColor.hsl;

  for (let i = 0; i < count; i++) {
    const saturation = Math.max(
      10,
      Math.min(100, baseHsl.s + (i - count / 2) * 15)
    );
    const lightness = Math.max(
      10,
      Math.min(90, baseHsl.l + (i - count / 2) * 10)
    );

    monochromatic.push(
      createColorValue({
        h: baseHsl.h,
        s: saturation,
        l: lightness,
      })
    );
  }

  return monochromatic;
};

// Generate a complete color palette
export const generateColorPalette = (
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
): ColorPalette => {
  const {
    tintsCount = 5,
    shadesCount = 5,
    includeHarmony = true,
    harmonyType = "complementary",
  } = options;

  const tints = generateTints(baseColor, tintsCount);
  const shades = generateShades(baseColor, shadesCount);

  let harmony: ColorValue[] | undefined;

  if (includeHarmony) {
    switch (harmonyType) {
      case "complementary":
        harmony = [generateComplementary(baseColor)];
        break;
      case "analogous":
        harmony = generateAnalogous(baseColor, 4);
        break;
      case "triadic":
        harmony = generateTriadic(baseColor);
        break;
      case "split-complementary":
        harmony = generateSplitComplementary(baseColor);
        break;
      case "tetradic":
        harmony = generateTetradic(baseColor);
        break;
      case "monochromatic":
        harmony = generateMonochromatic(baseColor, 6);
        break;
      default:
        harmony = [generateComplementary(baseColor)];
    }
  }

  return {
    id: `palette-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: `${baseColor.hex} Palette`,
    baseColor,
    tints,
    shades,
    harmony,
    createdAt: new Date(),
  };
};

// Generate random color
export const generateRandomColor = (): ColorValue => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 80) + 20; // 20-100% saturation
  const l = Math.floor(Math.random() * 60) + 20; // 20-80% lightness

  return createColorValue({ h, s, l });
};

// Generate web-safe colors
export const generateWebSafeColors = (): ColorValue[] => {
  const webSafeValues = [0, 51, 102, 153, 204, 255];
  const colors: ColorValue[] = [];

  webSafeValues.forEach((r) => {
    webSafeValues.forEach((g) => {
      webSafeValues.forEach((b) => {
        colors.push(createColorValue({ r, g, b }));
      });
    });
  });

  return colors;
};

// Generate material design colors
export const generateMaterialColors = (): Record<string, ColorValue[]> => {
  const materialPalettes = {
    red: [
      "#FFEBEE",
      "#FFCDD2",
      "#EF9A9A",
      "#E57373",
      "#EF5350",
      "#F44336",
      "#E53935",
      "#D32F2F",
      "#C62828",
      "#B71C1C",
    ],
    pink: [
      "#FCE4EC",
      "#F8BBD9",
      "#F48FB1",
      "#F06292",
      "#EC407A",
      "#E91E63",
      "#D81B60",
      "#C2185B",
      "#AD1457",
      "#880E4F",
    ],
    purple: [
      "#F3E5F5",
      "#E1BEE7",
      "#CE93D8",
      "#BA68C8",
      "#AB47BC",
      "#9C27B0",
      "#8E24AA",
      "#7B1FA2",
      "#6A1B9A",
      "#4A148C",
    ],
    blue: [
      "#E3F2FD",
      "#BBDEFB",
      "#90CAF9",
      "#64B5F6",
      "#42A5F5",
      "#2196F3",
      "#1E88E5",
      "#1976D2",
      "#1565C0",
      "#0D47A1",
    ],
    green: [
      "#E8F5E8",
      "#C8E6C9",
      "#A5D6A7",
      "#81C784",
      "#66BB6A",
      "#4CAF50",
      "#43A047",
      "#388E3C",
      "#2E7D32",
      "#1B5E20",
    ],
    orange: [
      "#FFF3E0",
      "#FFE0B2",
      "#FFCC80",
      "#FFB74D",
      "#FFA726",
      "#FF9800",
      "#FB8C00",
      "#F57C00",
      "#EF6C00",
      "#E65100",
    ],
  };

  const result: Record<string, ColorValue[]> = {};

  Object.entries(materialPalettes).forEach(([name, hexColors]) => {
    result[name] = hexColors.map((hex) => createColorValue(hex));
  });

  return result;
};

// Generate color variations with specific lightness levels
export const generateLightnessVariations = (
  baseColor: ColorValue,
  levels: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90]
): ColorValue[] => {
  const baseHsl = baseColor.hsl;

  return levels.map((lightness) =>
    createColorValue({
      h: baseHsl.h,
      s: baseHsl.s,
      l: lightness,
    })
  );
};

// Generate color variations with specific saturation levels
export const generateSaturationVariations = (
  baseColor: ColorValue,
  levels: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
): ColorValue[] => {
  const baseHsl = baseColor.hsl;

  return levels.map((saturation) =>
    createColorValue({
      h: baseHsl.h,
      s: saturation,
      l: baseHsl.l,
    })
  );
};
