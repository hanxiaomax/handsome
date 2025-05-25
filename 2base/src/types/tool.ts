import type { LucideIcon } from "lucide-react";

export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  category: "development" | "text" | "file" | "encode" | "crypto" | "image";
  tags: string[];
  requiresBackend: boolean;
  icon: LucideIcon;
  path: string;
}

export interface ToolPageState {
  toolId: string;
  processing: boolean;
  progress: number;
  error: string | null;
  inputType: "text" | "file";
  textInput: string;
  fileInput: File | null;
  params: Record<string, unknown>;
  output: {
    type: "text" | "file" | "image";
    content: string | Blob;
    metadata?: Record<string, unknown>;
  } | null;
}

export interface AppState {
  theme: "light" | "dark" | "system";
  tools: ToolInfo[];
  currentTool: string | null;
  loading: boolean;
  error: string | null;
}
