import type { ToolInfo } from "@/types/tool";
import { FileText } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "xml-parser",
  name: "XML Parser & Tree Visualizer",
  description:
    "High-performance XML file parser and hierarchy visualizer with streaming parse, selective loading, and interactive tree navigation for any XML structure",
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
  ],
  requiresBackend: false,
  icon: FileText,
  path: "/tools/arxml-parser",
  version: "1.1.0",
  releaseDate: "2024-01-21",
  pricing: "free",
};
