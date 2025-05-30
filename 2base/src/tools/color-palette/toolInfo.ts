import type { ToolInfo } from "@/types/tool";
import { Palette } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "color-palette",
  name: "Color Palette",
  description:
    "Comprehensive color management tool with format conversion, interactive picking, and palette generation",
  category: "development",
  tags: [
    "color",
    "palette",
    "design",
    "conversion",
    "hex",
    "rgb",
    "hsl",
    "hsv",
    "cmyk",
    "tints",
    "shades",
  ],
  requiresBackend: false,
  icon: Palette,
  path: "/tools/color-palette",
  version: "1.0.0",
  releaseDate: "2024-01-20",
  pricing: "free",
};
