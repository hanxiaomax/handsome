import type { LucideIcon } from "lucide-react";

export interface EditorState {
  content: string;
  cursorPosition: number;
  selectionStart: number;
  selectionEnd: number;
  scrollPosition: number;
  isDirty: boolean;
  fileName?: string;
  lastSaved: Date | null;
}

export interface EditorConfig {
  theme: "light" | "dark" | "auto";
  fontSize: number;
  lineNumbers: boolean;
  wordWrap: boolean;
  autoSave: boolean;
  vim: boolean;
  previewSync: boolean;
  previewVisible: boolean;
  splitRatio: number;
}

export interface ToolbarAction {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut: string;
  action: (content: string, selection: TextSelection) => TextEditResult;
  isActive?: (content: string, cursor: number) => boolean;
  separator?: boolean;
}

export interface TextSelection {
  start: number;
  end: number;
  text: string;
}

export interface TextEditResult {
  content: string;
  cursorPosition: number;
  selectionStart?: number;
  selectionEnd?: number;
}

export interface MarkdownParseResult {
  html: string;
  headings: Array<{
    level: number;
    text: string;
    id: string;
    line: number;
  }>;
  wordCount: number;
  charCount: number;
  readingTime: number;
  tableOfContents: string;
}

export interface FileImportResult {
  content: string;
  fileName: string;
  type: "markdown" | "text" | "unknown";
  size: number;
}

export interface ExportOptions {
  format: "markdown" | "html" | "pdf";
  includeTOC: boolean;
  includeCSS: boolean;
  fileName?: string;
  customCSS?: string;
}

export interface ValidationResult {
  line: number;
  column: number;
  message: string;
  type: "error" | "warning" | "info";
}

export interface EditorStats {
  wordCount: number;
  charCount: number;
  lineCount: number;
  readingTime: number;
  currentLine: number;
  currentColumn: number;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  alignment?: Array<"left" | "center" | "right">;
}

export interface LinkData {
  text: string;
  url: string;
  title?: string;
}

export interface ImageData {
  alt: string;
  src: string;
  title?: string;
  width?: number;
  height?: number;
}

export interface CodeBlockData {
  language: string;
  code: string;
}

export interface EditorCommand {
  id: string;
  type: "insert" | "replace" | "delete" | "format";
  content?: string;
  position?: number;
  selection?: TextSelection;
  timestamp: Date;
}

export interface EditorHistory {
  commands: EditorCommand[];
  currentIndex: number;
  maxSize: number;
}

export type ViewMode = "editor" | "preview" | "split";
export type ToolbarGroup = "format" | "insert" | "structure" | "file" | "view";
export type MarkdownFormat =
  | "bold"
  | "italic"
  | "strikethrough"
  | "code"
  | "heading"
  | "quote"
  | "list"
  | "link"
  | "image"
  | "table"
  | "codeblock";
