import type { ToolInfo } from "@/types/tool";
import { Calculator } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "unit-converter",
  name: "Unit Converter",
  description:
    "Comprehensive unit conversion tool with real-time conversion across multiple categories and educational information",
  category: "development",
  tags: ["converter", "units", "measurement", "calculator", "education"],
  requiresBackend: false,
  icon: Calculator,
  path: "/tools/unit-converter",
  version: "1.0.0",
  releaseDate: "2025-01-27",
  pricing: "free",
};
