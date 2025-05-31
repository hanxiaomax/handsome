import type { ToolInfo } from "@/types/tool";
import { FileText } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "arxml-parser",
  name: "ARXML Parser & Hierarchy Visualizer",
  description:
    "High-performance ARXML file parser and hierarchy visualizer for AUTOSAR architecture files with streaming parse and selective loading",
  category: "development",
  tags: [
    "arxml",
    "autosar",
    "xml",
    "parser",
    "hierarchy",
    "visualization",
    "automotive",
    "architecture",
    "stream-parsing",
  ],
  requiresBackend: false,
  icon: FileText,
  path: "/tools/arxml-parser",
  version: "1.0.0",
  releaseDate: "2024-01-20",
  pricing: "free",
};
