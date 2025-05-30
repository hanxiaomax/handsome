import type { ToolInfo } from "@/types/tool";
import { BarChart3 } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "product-chart-generator",
  name: "Product Chart Generator",
  description:
    "Generate professional charts for product management including radar charts, SWOT analysis, priority matrices and more",
  category: "development",
  tags: [
    "chart",
    "visualization",
    "product-management",
    "analysis",
    "radar",
    "swot",
    "strategy",
  ],
  requiresBackend: false,
  icon: BarChart3,
  path: "/tools/product-chart-generator",
  version: "1.0.0",
  releaseDate: "2024-01-20",
  pricing: "free",
};
