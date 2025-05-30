import type { ToolInfo } from "@/types/tool";
import { Smile } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "emoji-library",
  name: "Emoji Library",
  description:
    "Browse, search, and copy emojis with ease. Features categorized collections, favorites, recent usage, and smart search.",
  category: "text",
  tags: ["emoji", "unicode", "symbols", "copy", "search", "text"],
  requiresBackend: false,
  icon: Smile,
  path: "/tools/emoji-library",
  version: "1.0.0",
  releaseDate: "2024-01-20",
  pricing: "free",
};
