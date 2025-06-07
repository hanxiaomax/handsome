import type { ToolInfo } from "@/types/tool";
import { toolInfo as programmerCalculatorInfo } from "@/tools/programmer-calculator/toolInfo";
import { toolInfo as uuidGeneratorInfo } from "@/tools/uuid-generator/toolInfo";
import { toolInfo as worldClockInfo } from "@/tools/world-clock/toolInfo";
import { toolInfo as unitConverterInfo } from "@/tools/unit-converter/toolInfo";
import { toolInfo as unixTimestampConverterInfo } from "@/tools/unix-timestamp-converter/toolInfo";
import { toolInfo as markdownEditorInfo } from "@/tools/markdown-editor/toolInfo";
import { toolInfo as emojiLibraryInfo } from "@/tools/emoji-library/toolInfo";
import { toolInfo as colorPaletteInfo } from "@/tools/color-palette/toolInfo";
import { toolInfo as productChartGeneratorInfo } from "@/tools/product-chart-generator/toolInfo";
import { toolInfo as xmlParserInfo } from "@/tools/xml-parser/toolInfo";
import { toolInfo as layoutDemoInfo } from "@/tools/layout-demo/toolInfo";
import { toolInfo as calculatorInfo } from "@/tools/calculator/toolInfo";

export const tools: ToolInfo[] = [
  // All implemented tools with their actual toolInfo
  layoutDemoInfo, // Demo tool for layout showcase
  calculatorInfo, // Calculator component demonstration tool
  programmerCalculatorInfo,
  uuidGeneratorInfo,
  worldClockInfo,
  unitConverterInfo,
  unixTimestampConverterInfo,
  markdownEditorInfo,
  emojiLibraryInfo,
  colorPaletteInfo,
  productChartGeneratorInfo,
  xmlParserInfo,
];

export const categories = [
  { id: "all", name: "All Tools", count: tools.length },
  {
    id: "development",
    name: "Development Tools",
    count: tools.filter((t) => t.category === "development").length,
  },
  {
    id: "text",
    name: "Text Tools",
    count: tools.filter((t) => t.category === "text").length,
  },
  {
    id: "file",
    name: "File Tools",
    count: tools.filter((t) => t.category === "file").length,
  },
  {
    id: "encode",
    name: "Encoding Tools",
    count: tools.filter((t) => t.category === "encode").length,
  },
  {
    id: "crypto",
    name: "Crypto Tools",
    count: tools.filter((t) => t.category === "crypto").length,
  },
  {
    id: "image",
    name: "Image Tools",
    count: tools.filter((t) => t.category === "image").length,
  },
];
