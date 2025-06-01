import type { ToolInfo } from "@/types/tool";
import { Monitor } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "layout-demo",
  name: "Skeleton Demo",
  description:
    "Interactive demonstration of skeleton loading states and placeholder components",
  category: "development",
  tags: ["skeleton", "ui", "demo", "loading", "placeholder"],
  requiresBackend: false,
  icon: Monitor,
  path: "/tools/layout-demo",
  version: "2.0.0",
  releaseDate: "2024-12-01",
  pricing: "free",
};
