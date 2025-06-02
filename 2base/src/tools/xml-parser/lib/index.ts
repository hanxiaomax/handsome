// Export main engine
export { XMLStreamParser } from "./engine";

// Export XML parser utilities
export { xmlParser } from "./xmlParser";

// Export custom hooks
export { useXMLParser } from "./useXMLParser";
export { useXMLParserState } from "./hooks/useXMLParserState";
export { useXMLParserLogic } from "./hooks/useXMLParserLogic";

// Export formatting utilities
export { beautifyXML, compressXML, convertXMLToJSON } from "./xmlFormatter";

// Export file handling utilities
export {
  isXMLFile,
  readFileContent,
  extractFileInfo,
  shouldAutoParseFile,
  getXMLFilesFromDragEvent,
  formatFileSize,
} from "./fileHandler";
export type { FileInfo, FileUploadState } from "./fileHandler";

// Export clipboard and download utilities
export {
  copyToClipboard,
  downloadAsFile,
  generateFilename,
  getMimeType,
  prepareContentForExport,
} from "./clipboardUtils";
export type { ContentFormat } from "./clipboardUtils";

// Export all types
export type {
  XMLElement,
  XMLElementType,
  ParseOptions,
  ParserState,
  ParseError,
  ParseWarning,
  SearchIndex,
  SearchResult,
  TreeFilter,
  PerformanceMetrics,
  ExportOptions,
  TreeState,
  VirtualTreeItem,
  FileProcessingOptions,
  ParserActions,
} from "../types";
