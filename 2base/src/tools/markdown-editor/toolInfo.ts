import type { ToolInfo } from "@/types/tool";
import { FileText } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "markdown-editor",
  name: "Markdown Editor",
  description:
    "Advanced Markdown editor with real-time preview, syntax highlighting, and export capabilities",
  category: "text",
  tags: ["markdown", "editor", "preview", "text", "documentation", "writing"],
  requiresBackend: false,
  icon: FileText,
  path: "/tools/markdown-editor",
  version: "1.0.0",
  releaseDate: "2024-12-25",
  pricing: "free",
};
