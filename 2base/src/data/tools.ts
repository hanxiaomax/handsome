import { Hash, FileText, Image, Lock, Code2 } from "lucide-react";
import type { ToolInfo } from "@/types/tool";
import { toolInfo as programmerCalculatorInfo } from "@/tools/programmer-calculator/toolInfo";
import { toolInfo as uuidGeneratorInfo } from "@/tools/uuid-generator/toolInfo";
import { toolInfo as worldClockInfo } from "@/tools/world-clock/toolInfo";
import { toolInfo as unitConverterInfo } from "@/tools/unit-converter/toolInfo";
import { toolInfo as unixTimestampConverterInfo } from "@/tools/unix-timestamp-converter/toolInfo";
import { toolInfo as markdownEditorInfo } from "@/tools/markdown-editor/toolInfo";
import { toolInfo as emojiLibraryInfo } from "@/tools/emoji-library/toolInfo";
import { toolInfo as colorPaletteInfo } from "@/tools/color-palette/toolInfo";

// Import other tool info when they are created
// import { toolInfo as hashGeneratorInfo } from "@/tools/hash-generator/toolInfo";
// import { toolInfo as textFormatterInfo } from "@/tools/text-formatter/toolInfo";
// etc.

export const tools: ToolInfo[] = [
  // Use imported tool info for existing tools
  programmerCalculatorInfo,
  uuidGeneratorInfo,
  worldClockInfo,
  unitConverterInfo,
  unixTimestampConverterInfo,
  markdownEditorInfo,
  emojiLibraryInfo,
  colorPaletteInfo,

  // Temporary definitions for tools that don't have toolInfo.ts yet
  {
    id: "hash-generator",
    name: "Hash Generator",
    description:
      "Generate MD5, SHA1, SHA256 and other hash values for text and files",
    category: "crypto",
    tags: ["hash", "md5", "sha", "crypto", "security"],
    requiresBackend: false,
    icon: Hash,
    path: "/tools/hash-generator",
    version: "2.1.0",
    releaseDate: "2024-08-20", // Old tool, released more than 3 months ago
    pricing: "free",
  },
  {
    id: "text-formatter",
    name: "Text Formatter",
    description: "Format, beautify and transform text with various options",
    category: "text",
    tags: ["format", "beautify", "transform", "text", "utility"],
    requiresBackend: false,
    icon: FileText,
    path: "/tools/text-formatter",
    version: "1.0.3",
    releaseDate: "2024-11-20", // New tool, released within 3 months
    pricing: "paid",
  },
  {
    id: "image-converter",
    name: "Image Converter",
    description:
      "Convert images between different formats (PNG, JPG, WebP, etc.)",
    category: "image",
    tags: ["image", "convert", "format", "png", "jpg", "webp"],
    requiresBackend: false,
    icon: Image,
    path: "/tools/image-converter",
    version: "3.2.1",
    releaseDate: "2024-07-15", // Old tool, released more than 3 months ago
    pricing: "paid",
  },
  {
    id: "base64-encoder",
    name: "Base64 Encoder/Decoder",
    description: "Encode and decode text and files to/from Base64 format",
    category: "encode",
    tags: ["base64", "encode", "decode", "text", "file"],
    requiresBackend: false,
    icon: Code2,
    path: "/tools/base64-encoder",
    version: "1.1.0",
    releaseDate: "2024-12-10", // New tool, released within 3 months
    pricing: "free",
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate secure passwords with customizable options",
    category: "crypto",
    tags: ["password", "generator", "security", "random", "secure"],
    requiresBackend: false,
    icon: Lock,
    path: "/tools/password-generator",
    version: "2.0.0",
    releaseDate: "2024-06-01", // Old tool, released more than 3 months ago
    pricing: "paid",
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
