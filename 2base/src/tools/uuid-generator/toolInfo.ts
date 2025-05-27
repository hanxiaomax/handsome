import type { ToolInfo } from "@/types/tool";
import { Hash } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "uuid-generator",
  name: "UUID Generator",
  description:
    "Generate UUIDs (v1, v4, v7) with multiple format options and batch generation",
  category: "development",
  tags: ["uuid", "generator", "development", "random"],
  requiresBackend: false,
  icon: Hash,
  path: "/tools/uuid-generator",
  version: "1.0.0",
  releaseDate: "2025-01-15",
  pricing: "free",
};
