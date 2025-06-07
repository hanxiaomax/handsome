import type { ToolInfo } from "@/types/tool";
import { Calculator } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "calculator",
  name: "Calculator",
  description: "Advanced scientific calculator with data binding capabilities",
  category: "development",
  tags: ["calculator", "math", "scientific", "computation", "utility"],
  requiresBackend: false,
  icon: Calculator,
  path: "/tools/calculator",
  version: "1.0.0",
  releaseDate: "2024-12-01",
  pricing: "free",
};
