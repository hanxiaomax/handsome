import type { ToolInfo } from "@/types/tool";
import { FileText } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "xml-parser",
  name: "XML Parser & Tree Visualizer",
  description:
    "Universal XML file parser and hierarchy visualizer with high-performance parsing, interactive tree navigation, and multi-format output for any XML structure",
  category: "development",
  tags: [
    "xml",
    "parser",
    "hierarchy",
    "visualization",
    "tree",
    "structure",
    "dom",
    "element",
    "stream-parsing",
    "universal",
    "autosar",
    "svg",
    "rss",
  ],
  requiresBackend: false,
  icon: FileText,
  path: "/tools/xml-parser",
  version: "1.1.0",
  releaseDate: "2024-01-21",
  pricing: "free",
};
