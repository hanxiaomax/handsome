/**
 * XML Parser Business Logic Hook
 *
 * Handles all business logic operations for the XML parser tool
 */

import { useCallback, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";

import {
  useXMLParser,
  beautifyXML,
  compressXML,
  convertXMLToJSON,
  readFileContent,
  extractFileInfo,
  shouldAutoParseFile,
  getXMLFilesFromDragEvent,
  copyToClipboard,
  downloadAsFile,
  generateFilename,
  getMimeType,
  prepareContentForExport,
} from "../index";

import type { XMLParserUIState } from "./useXMLParserState";
import type { ContentFormat } from "../clipboardUtils";

import type { XMLElement } from "../../types";

interface UIActions {
  setFileUpload: (fileUpload: Record<string, unknown>) => void;
  setInputMode: (mode: "file" | "text") => void;
  setSearchQuery: (query: string) => void;
  clearContent: () => void;
  setSelectedElement: (element: XMLElement | null) => void;
  toggleExpandedNode: (elementId: string) => void;
  expandAllNodes: (elementIds: string[]) => void;
  collapseAllNodes: () => void;
  setTextInput: (text: string) => void;
}

export function useXMLParserLogic(
  uiState: XMLParserUIState,
  uiActions: UIActions
) {
  // Core XML parsing functionality
  const { elements, parserState, parseXMLContent, searchElements } =
    useXMLParser();

  // Debounce timer for real-time parsing
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_DELAY = 1000; // 1 second delay for real-time parsing

  // Real-time text input handler with debouncing
  const handleTextInputChange = useCallback(
    (value: string) => {
      // Update text input immediately for responsive UI
      uiActions.setTextInput(value);

      // If auto-parse is enabled, debounce the parsing
      if (uiState.autoParseEnabled && value.trim()) {
        // Clear existing timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Set new timer for debounced parsing
        debounceTimerRef.current = setTimeout(() => {
          // Only parse if the content looks like XML (basic validation)
          const trimmedValue = value.trim();
          if (trimmedValue.startsWith("<") && trimmedValue.includes(">")) {
            parseXMLContent(trimmedValue, "text");
          }
        }, DEBOUNCE_DELAY);
      }
    },
    [uiState.autoParseEnabled, uiActions.setTextInput, parseXMLContent]
  );

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // File handling
  const handleFileSelect = useCallback(
    async (file: File) => {
      try {
        const content = await readFileContent(file);
        const fileInfo = extractFileInfo(file);

        uiActions.setFileUpload({
          isDragOver: false,
          selectedFile: file,
          fileInfo,
          content: beautifyXML(content),
          originalContent: content,
        });

        uiActions.setInputMode("file");

        if (shouldAutoParseFile(file, uiState.autoParseEnabled)) {
          toast.info("Starting auto-parse...", {
            description: "File loaded successfully, parsing XML content",
          });
          setTimeout(() => {
            parseXMLContent(content, "file");
          }, 100);
        } else if (!uiState.autoParseEnabled) {
          toast.success("File loaded successfully!", {
            description: "Click the parse button to process the XML content",
          });
        }
      } catch (error) {
        console.error("Failed to read file:", error);
        toast.error("Failed to read file", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    [uiState.autoParseEnabled, parseXMLContent, uiActions]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const xmlFiles = getXMLFilesFromDragEvent(e);

      if (xmlFiles.length > 0) {
        handleFileSelect(xmlFiles[0]);
      } else {
        toast.error("Invalid file type", {
          description:
            "Please drop a valid XML file (.xml, .arxml, .xsd, .svg)",
        });
      }

      uiActions.setFileUpload({ isDragOver: false });
    },
    [handleFileSelect, uiActions]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      uiActions.setFileUpload({ isDragOver: true });
    },
    [uiActions]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      uiActions.setFileUpload({ isDragOver: false });
    },
    [uiActions]
  );

  // Parsing operations
  const handleStartParsing = useCallback(async () => {
    if (uiState.inputMode === "text") {
      if (!uiState.textInput.trim()) {
        toast.error("Please enter XML content", {
          description: "Text input area cannot be empty",
        });
        return;
      }
      await parseXMLContent(uiState.textInput, "text");
    } else {
      if (!uiState.fileUpload.selectedFile) {
        toast.error("Please select a file", {
          description: "You need to upload an XML file first",
        });
        return;
      }
      const content = uiState.fileUpload.originalContent;
      await parseXMLContent(content, "file");
    }
  }, [
    uiState.inputMode,
    uiState.textInput,
    uiState.fileUpload,
    parseXMLContent,
  ]);

  // Search operations
  const handleSearch = useCallback(
    (query: string) => {
      uiActions.setSearchQuery(query);
      searchElements(query);
    },
    [searchElements, uiActions]
  );

  // Copy and download operations
  const handleCopy = useCallback(async () => {
    if (
      !uiState.fileUpload.content &&
      !uiState.fileUpload.originalContent &&
      !uiState.textInput.trim()
    ) {
      toast.error("No content to copy", {
        description: "Please upload a file or enter text first",
      });
      return;
    }

    try {
      const sourceContent =
        uiState.fileUpload.originalContent || uiState.textInput;
      const content = prepareContentForExport(
        uiState.displayMode as ContentFormat,
        sourceContent,
        elements,
        {
          beautify: beautifyXML,
          compress: compressXML,
          convertToJSON: convertXMLToJSON,
        }
      );

      await copyToClipboard(content, uiState.displayMode);
    } catch (error) {
      console.error("Copy operation failed:", error);
    }
  }, [uiState.fileUpload, uiState.textInput, uiState.displayMode, elements]);

  const handleDownload = useCallback(() => {
    if (
      !uiState.fileUpload.content &&
      !uiState.fileUpload.originalContent &&
      !uiState.textInput.trim()
    ) {
      return;
    }

    try {
      const sourceContent =
        uiState.fileUpload.originalContent || uiState.textInput;
      const content = prepareContentForExport(
        uiState.displayMode as ContentFormat,
        sourceContent,
        elements,
        {
          beautify: beautifyXML,
          compress: compressXML,
          convertToJSON: convertXMLToJSON,
        }
      );

      const filename = generateFilename(
        uiState.fileUpload.fileInfo?.name,
        uiState.displayMode as ContentFormat
      );
      const mimeType = getMimeType(uiState.displayMode as ContentFormat);

      downloadAsFile(content, filename, mimeType);
    } catch (error) {
      console.error("Download operation failed:", error);
    }
  }, [uiState.fileUpload, uiState.textInput, uiState.displayMode, elements]);

  const handleClear = useCallback(() => {
    // Clear debounce timer when clearing content
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    uiActions.clearContent();
    if (uiState.inputMode === "file") {
      toast.success("File cleared!", {
        description: "File has been removed",
      });
    } else {
      toast.success("Text cleared!", {
        description: "Text input has been cleared",
      });
    }
  }, [uiState.inputMode, uiActions]);

  // Computed values
  const computed = useMemo(() => {
    const sourceContent =
      uiState.fileUpload.originalContent || uiState.textInput;

    return {
      // Content for different display modes
      beautifiedContent: sourceContent ? beautifyXML(sourceContent) : "",
      compressedContent: sourceContent ? compressXML(sourceContent) : "",
      jsonContent: sourceContent ? convertXMLToJSON(sourceContent) : "",

      // Status flags
      hasContent: !!(
        uiState.fileUpload.content ||
        uiState.fileUpload.originalContent ||
        uiState.textInput.trim()
      ),
      canParse:
        !uiState.autoParseEnabled &&
        (uiState.inputMode === "file"
          ? !!uiState.fileUpload.selectedFile
          : !!uiState.textInput.trim()),
      canClear:
        uiState.inputMode === "file"
          ? !!uiState.fileUpload.fileInfo
          : !!uiState.textInput.trim(),

      // Real-time parsing status
      isRealTimeParsing:
        uiState.autoParseEnabled && uiState.inputMode === "text",

      // Display content based on mode
      displayContent: (() => {
        if (!sourceContent) return null;

        switch (uiState.displayMode) {
          case "beautified":
            return beautifyXML(sourceContent);
          case "compressed":
            return compressXML(sourceContent);
          case "json":
            return convertXMLToJSON(sourceContent);
          default:
            return sourceContent;
        }
      })(),
    };
  }, [uiState, elements]);

  // Event handlers
  const handlers = {
    // File operations
    onFileSelect: handleFileSelect,
    onFileInputChange: handleFileInputChange,
    onFileDrop: handleFileDrop,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,

    // Text input operations
    onTextInputChange: handleTextInputChange,

    // Parsing operations
    onParse: handleStartParsing,
    onSearch: handleSearch,

    // Export operations
    onCopy: handleCopy,
    onDownload: handleDownload,
    onClear: handleClear,

    // Tree navigation
    onElementSelect: uiActions.setSelectedElement,
    onNodeToggle: uiActions.toggleExpandedNode,
    onExpandAll: () => uiActions.expandAllNodes(elements.map((e) => e.id)),
    onCollapseAll: uiActions.collapseAllNodes,
  };

  return {
    // Core data
    elements,
    parserState,

    // Computed values
    computed,

    // Event handlers
    handlers,
  };
}
