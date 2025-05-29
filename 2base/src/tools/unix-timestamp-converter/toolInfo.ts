import type { ToolInfo } from "@/types/tool";
import { Clock } from "lucide-react";

export const toolInfo: ToolInfo = {
  id: "unix-timestamp-converter",
  name: "Unix Timestamp Converter",
  description:
    "Convert between Unix timestamps and human-readable dates with real-time display and batch processing",
  category: "development",
  tags: ["timestamp", "unix", "date", "time", "converter", "developer"],
  requiresBackend: false,
  icon: Clock,
  path: "/tools/unix-timestamp-converter",
  version: "1.0.0",
  releaseDate: "2024-12-25",
  pricing: "free",
};
