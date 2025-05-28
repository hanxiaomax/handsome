import type { ToolInfo } from "@/types/tool";
import { Clock } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "world-clock",
  name: "World Clock",
  description:
    "Track multiple time zones, schedule meetings across regions, and visualize day/night cycles for global collaboration",
  category: "development",
  tags: ["time", "timezone", "meeting", "global", "schedule"],
  requiresBackend: false,
  icon: Clock,
  path: "/tools/world-clock",
  version: "1.0.0",
  releaseDate: "2025-01-27",
  pricing: "free",
};
