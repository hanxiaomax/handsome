import { Calculator } from "lucide-react";
import type { ToolInfo } from "@/types/tool";

export const tools: ToolInfo[] = [
  {
    id: "programmer-calculator",
    name: "Programmer Calculator",
    description:
      "Advanced calculator with base conversion and bitwise operations for developers",
    category: "development",
    tags: ["calculator", "binary", "hex", "bitwise", "programming"],
    requiresBackend: false,
    icon: Calculator,
    path: "/tools/programmer-calculator",
  },
];

export const categories = [
  { id: "all", name: "All Tools", count: tools.length },
  {
    id: "development",
    name: "Development Tools",
    count: tools.filter((t) => t.category === "development").length,
  },
  {
    id: "text",
    name: "Text Tools",
    count: tools.filter((t) => t.category === "text").length,
  },
  {
    id: "file",
    name: "File Tools",
    count: tools.filter((t) => t.category === "file").length,
  },
  {
    id: "encode",
    name: "Encoding Tools",
    count: tools.filter((t) => t.category === "encode").length,
  },
  {
    id: "crypto",
    name: "Crypto Tools",
    count: tools.filter((t) => t.category === "crypto").length,
  },
  {
    id: "image",
    name: "Image Tools",
    count: tools.filter((t) => t.category === "image").length,
  },
];
