import { Calculator } from "lucide-react";
import type { ToolInfo } from "@/types/tool";

export const toolInfo: ToolInfo = {
  id: "programmer-calculator",
  name: "Programmer Calculator",
  description:
    "Advanced calculator with base conversion and bitwise operations for developers",
  category: "development",
  tags: ["calculator", "binary", "hex", "bitwise", "programming"],
  requiresBackend: false,
  icon: Calculator,
  path: "/tools/programmer-calculator",
  version: "1.2.0",
  releaseDate: "2025-05-15", // This is a new tool, released within 3 months
  pricing: "free",
};
