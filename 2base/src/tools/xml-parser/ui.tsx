"use client";

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

// Icons
import {
  FileText,
  Upload,
  Search,
  Play,
  Trash2,
  FileCode,
  AlertCircle,
  Copy,
  Download,
  TreePine,
  Minimize2,
  Home,
  FileJson,
  Brackets,
  Loader2,
  Hash as LineNumbers,
  Zap,
  ExpandIcon,
  ShrinkIcon,
} from "lucide-react";

// Layout
import { ToolLayout } from "@/components/layout/tool-layout";

// Tool components
import { toolInfo } from "./toolInfo";
import { XMLStreamParser } from "./lib";
import { xmlParser } from "./lib/xmlParser";
import type { XMLElement, ParserState } from "./types";

interface FileUploadState {
  isDragOver: boolean;
  selectedFile: File | null;
  fileInfo: {
    name: string;
    size: number;
    type: string;
  } | null;
  content: string;
  originalContent: string; // Store original formatting
}

type DisplayMode = "beautified" | "tree" | "compressed" | "json";

export default function XMLParser() {
  const navigate = useNavigate();

  // Core state
  const [parser] = useState(() => new XMLStreamParser());
  const [elements, setElements] = useState<XMLElement[]>([]);
  const [parserState, setParserState] = useState<ParserState>({
    status: "idle",
    progress: 0,
    currentSection: "",
    elementsProcessed: 0,
    memoryUsage: 0,
    errors: [],
    warnings: [],
  });

  // UI state
  const [fileUpload, setFileUpload] = useState<FileUploadState>({
    isDragOver: false,
    selectedFile: null,
    fileInfo: null,
    content: "",
    originalContent: "",
  });
  const [selectedElement, setSelectedElement] = useState<XMLElement | null>(
    null
  );
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("beautified");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);
  const [autoParseEnabled, setAutoParseEnabled] = useState(true);
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [textInput, setTextInput] = useState("");

  // Parse options (kept for compatibility but not actively used with fast-xml-parser)
  // const [parseOptions] = useState<ParseOptions>({
  //   packages: [],
  //   elementTypes: [],
  //   maxDepth: 50,
  //   maxElements: 100000,
  //   validateSchema: true,
  //   enableReferences: true,
  //   memoryLimit: 500 * 1024 * 1024,
  // });

  // Improved XML beautification that preserves and enhances indentation
  const getBeautifiedXML = useCallback((content: string): string => {
    try {
      // Normalize line endings and remove excessive whitespace
      const normalized = content
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\n\s*\n/g, "\n")
        .trim();

      // Always use manual formatting for more predictable results
      // DOM parsing can sometimes alter the structure in unexpected ways
      return formatXMLManually(normalized);
    } catch (error) {
      console.warn("XML beautification error:", error);
      // Fallback to original content with basic formatting
      return content.replace(/></g, ">\n<");
    }
  }, []);

  const formatXMLManually = (content: string): string => {
    // More robust manual formatting with proper indentation
    let formatted = content.replace(/></g, ">\n<").replace(/^\s+|\s+$/g, ""); // Trim whitespace

    // Handle mixed content (text between tags) more carefully
    formatted = formatted.replace(/>\s*([^<>\s][^<]*?)\s*</g, ">$1<");

    const lines = formatted.split("\n");
    let indentLevel = 0;
    const indentSize = 2;
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) continue;

      // Check for different tag types
      const isClosingTag = trimmed.startsWith("</");
      const isSelfClosingTag = trimmed.match(/^<[^>]+\/>$/);
      const isProcessingInstruction = trimmed.startsWith("<?");
      const isComment = trimmed.startsWith("<!--");
      const isDTD =
        trimmed.startsWith("<!DOCTYPE") ||
        trimmed.startsWith("<!ELEMENT") ||
        trimmed.startsWith("<!ATTLIST");
      const isOpeningTag =
        trimmed.startsWith("<") &&
        !isClosingTag &&
        !isSelfClosingTag &&
        !isProcessingInstruction &&
        !isComment &&
        !isDTD;

      // Handle mixed content (opening tag with text content on same line)
      const mixedContentMatch = trimmed.match(/^(<[^>]+>)([^<]+)(<\/[^>]+>)$/);
      if (mixedContentMatch) {
        // This is a complete element with text content on one line
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
        continue;
      }

      // Handle closing tags - decrease indent level BEFORE applying
      if (isClosingTag) {
        indentLevel = Math.max(0, indentLevel - 1);
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
        continue;
      }

      // Handle self-closing tags - use current indent level
      if (isSelfClosingTag) {
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
        continue;
      }

      // Handle processing instructions, comments, and DTD - use current indent level
      if (isProcessingInstruction || isComment || isDTD) {
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
        continue;
      }

      // Handle opening tags - use current indent level THEN increase
      if (isOpeningTag) {
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
        indentLevel++;
        continue;
      }

      // Handle text content - use current indent level
      // Only add if it's meaningful text content
      if (trimmed.length > 0) {
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
      }
    }

    return result.join("\n");
  };

  // File handling with auto-parse
  const handleFileSelect = useCallback(
    async (file: File) => {
      console.log("File selected:", file.name, file.size);
      try {
        const content = await file.text();
        const fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
        };

        setFileUpload({
          isDragOver: false,
          selectedFile: file,
          fileInfo,
          content: getBeautifiedXML(content), // Store beautified version for display
          originalContent: content, // Store original for reference
        });

        // Switch to file mode when file is selected
        setInputMode("file");

        // Auto-parse if enabled and file is not too large (< 10MB)
        if (autoParseEnabled && file.size < 10 * 1024 * 1024) {
          toast.info("Starting auto-parse...", {
            description: "File loaded successfully, parsing XML content",
          });
          setTimeout(() => {
            handleStartParsing(file);
          }, 100);
        } else if (!autoParseEnabled) {
          toast.success("File loaded successfully!", {
            description: "Click the parse button to process the XML content",
          });
        }
      } catch (error) {
        console.error("Failed to read file:", error);
      }
    },
    [autoParseEnabled, getBeautifiedXML]
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
      const files = Array.from(e.dataTransfer.files);
      const xmlFile = files.find(
        (file) =>
          file.name.toLowerCase().endsWith(".arxml") ||
          file.name.toLowerCase().endsWith(".xml") ||
          file.name.toLowerCase().endsWith(".xsd") ||
          file.name.toLowerCase().endsWith(".svg")
      );

      if (xmlFile) {
        handleFileSelect(xmlFile);
      }

      setFileUpload((prev) => ({ ...prev, isDragOver: false }));
    },
    [handleFileSelect]
  );

  // Parsing with improved XML parser
  const handleStartParsing = useCallback(
    async (file?: File) => {
      // Determine content source
      let content: string;
      if (inputMode === "text") {
        if (!textInput.trim()) {
          toast.error("请输入XML内容", {
            description: "文本输入区域不能为空",
          });
          return;
        }
        content = textInput;
      } else {
        const targetFile = file || fileUpload.selectedFile;
        if (!targetFile) {
          toast.error("请选择文件", {
            description: "需要先上传XML文件",
          });
          return;
        }
        // Read file content
        content = fileUpload.originalContent || (await targetFile.text());
      }

      try {
        setParserState((prev) => ({
          ...prev,
          status: "parsing",
          progress: 0,
          currentSection:
            inputMode === "text" ? "Reading text input..." : "Reading file...",
        }));

        setParserState((prev) => ({
          ...prev,
          progress: 30,
          currentSection: "Parsing XML structure...",
        }));

        // Parse with fast-xml-parser
        const treeNodes = xmlParser.parseXMLToTree(content);

        setParserState((prev) => ({
          ...prev,
          progress: 70,
          currentSection: "Converting to elements...",
        }));

        // Convert to XMLElement format for compatibility
        const parsedElements = xmlParser.convertToXMLElements(treeNodes);

        setParserState((prev) => ({
          ...prev,
          progress: 100,
          currentSection: "Complete",
          status: "complete",
        }));

        setElements(parsedElements);
        toast.success("XML parsed successfully!", {
          description: `Found ${parsedElements.length} elements in the XML structure`,
        });
      } catch (error) {
        console.error("Failed to parse XML:", error);
        setParserState((prev) => ({
          ...prev,
          status: "error",
          errors: [
            ...prev.errors,
            {
              id: Date.now().toString(),
              type: "syntax",
              message:
                error instanceof Error
                  ? error.message
                  : "Unknown parsing error",
              severity: "error",
            },
          ],
        }));

        toast.error("Failed to parse XML", {
          description:
            error instanceof Error ? error.message : "Unknown parsing error",
        });
      }
    },
    [fileUpload.selectedFile, fileUpload.originalContent, inputMode, textInput]
  );

  // Note: Individual clear functions are now handled inline in the smart clear button

  // Search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        parser.searchElements(query);
      }
    },
    [parser]
  );

  // Tree navigation
  const handleElementSelect = useCallback((element: XMLElement) => {
    setSelectedElement(element);
    // Update breadcrumb
    const path = element.path.split("/").filter(Boolean);
    setBreadcrumb(path);
  }, []);

  const handleNodeToggle = useCallback((elementId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(elementId)) {
        newSet.delete(elementId);
      } else {
        newSet.add(elementId);
      }
      return newSet;
    });
  }, []);

  const getCompressedXML = useCallback((content: string): string => {
    // Improved compression with optional word wrapping
    const compressed = content
      .replace(/>\s+</g, "><")
      .replace(/\s+/g, " ")
      .trim();

    // Add word wrapping for better readability in compressed mode
    const maxLineLength = 120;
    const lines: string[] = [];
    let currentLine = "";

    // Split by tags to preserve XML structure
    const parts = compressed.split(/(<[^>]*>)/);

    for (const part of parts) {
      if (!part) continue;

      if (currentLine.length + part.length > maxLineLength) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = part;
        } else {
          // If single part is too long, add it anyway
          lines.push(part);
        }
      } else {
        currentLine += part;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join("\n");
  }, []);

  const convertToJSON = useCallback((content: string): string => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, "text/xml");

      const xmlToJson = (node: Node): Record<string, unknown> => {
        const result: Record<string, unknown> = {};

        // Handle attributes
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.attributes && element.attributes.length > 0) {
            const attrs: Record<string, string> = {};
            for (let i = 0; i < element.attributes.length; i++) {
              const attr = element.attributes[i];
              attrs[`@${attr.name}`] = attr.value;
            }
            result.attributes = attrs;
          }
        }

        // Handle child nodes
        const children: Record<string, unknown> = {};

        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];

          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) {
              result.text = text;
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const childName = child.nodeName;
            const childValue = xmlToJson(child);

            if (children[childName]) {
              if (!Array.isArray(children[childName])) {
                children[childName] = [children[childName]];
              }
              (children[childName] as unknown[]).push(childValue);
            } else {
              children[childName] = childValue;
            }
          }
        }

        if (Object.keys(children).length > 0) {
          result.children = children;
        }

        return result;
      };

      const json = xmlToJson(xmlDoc.documentElement);
      return JSON.stringify(json, null, 2);
    } catch {
      return JSON.stringify(
        { error: "Failed to convert XML to JSON" },
        null,
        2
      );
    }
  }, []);

  // Render functions
  const renderTreeNode = useCallback(
    (element: XMLElement, depth: number = 0) => {
      const isExpanded = expandedNodes.has(element.id);
      const hasChildren =
        element.hasChildren && element.children && element.children.length > 0;
      const isSelected = selectedElement?.id === element.id;

      return (
        <div key={element.id}>
          <div
            className={`flex items-center gap-2 py-1 px-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors ${
              isSelected ? "bg-primary/10 border-l-2 border-primary" : ""
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => handleElementSelect(element)}
          >
            {/* Tree expansion indicator */}
            <div className="w-4 h-4 flex items-center justify-center">
              {hasChildren ? (
                <button
                  className="w-3 h-3 flex items-center justify-center hover:bg-muted rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeToggle(element.id);
                  }}
                >
                  {isExpanded ? "−" : "+"}
                </button>
              ) : (
                <span className="w-3 h-3 flex items-center justify-center text-muted-foreground">
                  •
                </span>
              )}
            </div>

            {/* Element name */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span
                className={`truncate ${
                  element.type === "ELEMENT"
                    ? "font-medium text-blue-600"
                    : "text-muted-foreground"
                }`}
              >
                {element.name}
              </span>

              {/* Children count for expanded nodes */}
              {hasChildren && (
                <span className="text-xs text-muted-foreground shrink-0">
                  ({element.children?.length})
                </span>
              )}
            </div>

            {/* Element type indicator */}
            {element.type !== "ELEMENT" && (
              <span className="text-xs text-muted-foreground uppercase px-1 py-0.5 bg-muted/50 rounded">
                {element.type}
              </span>
            )}
          </div>

          {/* Children */}
          {hasChildren && isExpanded && element.children && (
            <div>
              {element.children.map((child) =>
                renderTreeNode(child, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    },
    [expandedNodes, selectedElement, handleElementSelect, handleNodeToggle]
  );

  const renderSourceCode = useCallback(
    (content: string) => {
      const lines = content.split("\n");
      return (
        <div className="font-mono text-sm">
          {lines.map((line, index) => (
            <div key={index} className="flex hover:bg-muted/30 min-h-[1.2rem]">
              {showLineNumbers && (
                <span className="text-muted-foreground text-xs w-12 flex-shrink-0 text-right pr-4 select-none border-r mr-4">
                  {index + 1}
                </span>
              )}
              <span className="flex-1 whitespace-pre-wrap break-all">
                {line || " "}
              </span>
            </div>
          ))}
        </div>
      );
    },
    [showLineNumbers]
  );

  const getRightPanelContent = useCallback(() => {
    if (!fileUpload.content && !fileUpload.originalContent) return null;

    const sourceContent = fileUpload.originalContent || fileUpload.content;

    switch (displayMode) {
      case "beautified":
        return (
          <ScrollArea className="h-full w-full">
            <div className="p-4">
              {renderSourceCode(getBeautifiedXML(sourceContent))}
            </div>
          </ScrollArea>
        );
      case "compressed":
        return (
          <ScrollArea className="h-full w-full">
            <div className="p-4">
              {renderSourceCode(getCompressedXML(sourceContent))}
            </div>
          </ScrollArea>
        );
      case "json":
        return (
          <ScrollArea className="h-full w-full">
            <div className="p-4">
              {renderSourceCode(convertToJSON(sourceContent))}
            </div>
          </ScrollArea>
        );
      case "tree":
        return elements.length > 0 ? (
          <ScrollArea className="h-full w-full">
            <div className="p-4 space-y-0">
              {elements
                .slice(0, 100)
                .map((element) => renderTreeNode(element, 0))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {parserState.status === "parsing" ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Parsing XML file...</p>
              </div>
            ) : (
              <>
                <TreePine className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Parse the XML file to view tree structure</p>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  }, [
    fileUpload.content,
    fileUpload.originalContent,
    displayMode,
    elements,
    getBeautifiedXML,
    getCompressedXML,
    convertToJSON,
    renderSourceCode,
    renderTreeNode,
    parserState.status,
  ]);

  const handleCopy = useCallback(async () => {
    if (!fileUpload.content && !fileUpload.originalContent) {
      toast.error("No content to copy", {
        description: "Please upload a file first",
      });
      return;
    }

    let content: string;
    const sourceContent = fileUpload.originalContent || fileUpload.content;

    try {
      switch (displayMode) {
        case "beautified":
          content = getBeautifiedXML(sourceContent);
          break;
        case "compressed":
          content = getCompressedXML(sourceContent);
          break;
        case "json":
          content = convertToJSON(sourceContent);
          break;
        case "tree":
          content = JSON.stringify(elements, null, 2);
          break;
        default:
          content = sourceContent;
      }

      // Use both modern and fallback clipboard methods
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = content;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error("Fallback copy failed");
        }
      }

      toast.success("Content copied to clipboard!", {
        description: `${
          displayMode.charAt(0).toUpperCase() + displayMode.slice(1)
        } format copied successfully`,
      });
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy content", {
        description: "Please try again or check your browser permissions",
      });
    }
  }, [
    fileUpload,
    displayMode,
    elements,
    getBeautifiedXML,
    getCompressedXML,
    convertToJSON,
  ]);

  const handleDownload = useCallback(() => {
    if (!fileUpload.content && !fileUpload.originalContent) return;

    let content: string;
    let filename: string;
    let mimeType: string;
    const sourceContent = fileUpload.originalContent || fileUpload.content;

    switch (displayMode) {
      case "beautified":
        content = getBeautifiedXML(sourceContent);
        filename = `${fileUpload.fileInfo?.name || "file"}_beautified.xml`;
        mimeType = "text/xml";
        break;
      case "compressed":
        content = getCompressedXML(sourceContent);
        filename = `${fileUpload.fileInfo?.name || "file"}_compressed.xml`;
        mimeType = "text/xml";
        break;
      case "json":
        content = convertToJSON(sourceContent);
        filename = `${fileUpload.fileInfo?.name || "file"}.json`;
        mimeType = "application/json";
        break;
      case "tree":
        content = JSON.stringify(elements, null, 2);
        filename = `${fileUpload.fileInfo?.name || "file"}_tree.json`;
        mimeType = "application/json";
        break;
      default:
        return;
    }

    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("File downloaded successfully!", {
        description: `${filename} has been saved to your downloads`,
      });
    } catch {
      toast.error("Failed to download file", {
        description: "Please try again",
      });
    }
  }, [
    fileUpload,
    displayMode,
    elements,
    getBeautifiedXML,
    getCompressedXML,
    convertToJSON,
  ]);

  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      onClose={() => navigate("/")}
      onMinimize={() => {}}
      onFullscreen={() => {}}
      isFullscreen={false}
    >
      <div className="flex flex-col h-full mt-12">
        {/* Resizable Panel Group */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - Source XML */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full overflow-hidden">
              {/* Left Panel Status Bar - File info and status display only */}
              <div
                id="left-status-bar"
                className="border-b bg-background p-3 h-14 flex-shrink-0"
              >
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-sm">Input XML</h3>
                    {fileUpload.fileInfo && (
                      <Badge variant="secondary" className="text-xs">
                        {fileUpload.fileInfo.name}
                      </Badge>
                    )}
                  </div>

                  {/* Status information only */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {fileUpload.fileInfo ? (
                      <span className="text-sm">
                        {(fileUpload.fileInfo.size / 1024).toFixed(1)} KB
                      </span>
                    ) : (
                      <span className="text-sm">No file loaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Left Panel Toolbar - Control buttons and operations */}
              <div
                id="left-toolbar"
                className="border-b bg-muted/20 p-3 h-12 flex-shrink-0"
              >
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-2">
                    {fileUpload.fileInfo ? (
                      <>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {fileUpload.fileInfo.name}
                          </span>
                        </div>

                        {parserState.status === "parsing" && (
                          <div className="flex items-center gap-2 ml-4">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-sm text-muted-foreground">
                              Parsing... {Math.round(parserState.progress)}%
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">No file selected</span>
                      </div>
                    )}
                  </div>

                  {/* Control buttons moved from status bar */}
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={showLineNumbers}
                            onPressedChange={setShowLineNumbers}
                            size="sm"
                            className={`h-7 w-7 p-0 ${
                              showLineNumbers
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : ""
                            }`}
                          >
                            <LineNumbers className="w-3 h-3" />
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Toggle line numbers</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={autoParseEnabled}
                            onPressedChange={setAutoParseEnabled}
                            size="sm"
                            className={`h-7 w-7 p-0 ${
                              autoParseEnabled
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : ""
                            }`}
                          >
                            <Zap className="w-3 h-3" />
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Auto parse on file load</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {!autoParseEnabled &&
                      (inputMode === "file"
                        ? fileUpload.selectedFile
                        : textInput.trim()) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => handleStartParsing()}
                                size="sm"
                                className="h-7 px-2"
                                disabled={parserState.status === "parsing"}
                              >
                                {parserState.status === "parsing" ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Parse XML{" "}
                                {inputMode === "file" ? "file" : "text"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                    <Separator orientation="vertical" className="h-6" />

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleCopy}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            disabled={
                              inputMode === "file"
                                ? !fileUpload.originalContent
                                : !textInput.trim()
                            }
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy source</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleDownload}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            disabled={
                              inputMode === "file"
                                ? !fileUpload.originalContent
                                : !textInput.trim()
                            }
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download source</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Smart Clear Button - shows when there's content to clear */}
                    {(inputMode === "file"
                      ? fileUpload.fileInfo
                      : textInput.trim()) && (
                      <>
                        <Separator orientation="vertical" className="h-6" />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => {
                                  if (inputMode === "file") {
                                    // Clear file
                                    setFileUpload({
                                      isDragOver: false,
                                      selectedFile: null,
                                      fileInfo: null,
                                      content: "",
                                      originalContent: "",
                                    });
                                    toast.success("File cleared!", {
                                      description: "File has been removed",
                                    });
                                  } else {
                                    // Clear text
                                    setTextInput("");
                                    toast.success("Text cleared!", {
                                      description:
                                        "Text input has been cleared",
                                    });
                                  }
                                  // Also clear parsed data
                                  setElements([]);
                                  setSelectedElement(null);
                                  setExpandedNodes(new Set());
                                  setSearchQuery("");
                                  setBreadcrumb([]);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Clear {inputMode === "file" ? "file" : "text"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Left Panel Visualization Area - Source content display */}
              <div
                id="left-visualization-area"
                className="flex-1 relative overflow-hidden"
              >
                {fileUpload.originalContent || textInput.trim() ? (
                  <ScrollArea className="h-full w-full">
                    <div className="p-4">
                      {/* Source code */}
                      {renderSourceCode(
                        inputMode === "text"
                          ? textInput
                          : fileUpload.originalContent
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  /* Input Tabs - File Upload or Text Input */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-2xl mx-auto p-8">
                      <Tabs
                        value={inputMode}
                        onValueChange={(value) =>
                          setInputMode(value as "file" | "text")
                        }
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                          <TabsTrigger
                            value="file"
                            className="flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            File Upload
                          </TabsTrigger>
                          <TabsTrigger
                            value="text"
                            className="flex items-center gap-2"
                          >
                            <FileCode className="w-4 h-4" />
                            Text Input
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="file" className="mt-0">
                          <div
                            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                              fileUpload.isDragOver
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-muted/20"
                            }`}
                            onDrop={handleFileDrop}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setFileUpload((prev) => ({
                                ...prev,
                                isDragOver: true,
                              }));
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              setFileUpload((prev) => ({
                                ...prev,
                                isDragOver: false,
                              }));
                            }}
                            onClick={() =>
                              document.getElementById("file-input")?.click()
                            }
                          >
                            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Upload XML File
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-3">
                              Drop your XML file here or click to browse
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                              Supports .xml, .arxml, .xsd, .svg files
                            </p>
                            <input
                              type="file"
                              accept=".xml,.arxml,.xsd,.svg,.rss,.atom"
                              onChange={handleFileInputChange}
                              className="hidden"
                              id="file-input"
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="text" className="mt-0">
                          <div className="space-y-4">
                            <div className="text-center mb-4">
                              <FileCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Paste XML Content
                              </h3>
                              <p className="text-gray-500 dark:text-gray-400">
                                Paste your XML content directly into the text
                                area below
                              </p>
                            </div>
                            <ScrollArea className="h-[400px] w-full border rounded-md">
                              <Textarea
                                placeholder="Paste your XML content here..."
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                className="min-h-[400px] font-mono text-sm border-none resize-none focus-visible:ring-0"
                              />
                            </ScrollArea>
                            {textInput.trim() && (
                              <div className="flex justify-end">
                                <Button
                                  onClick={() => handleStartParsing()}
                                  className="flex items-center gap-2"
                                  disabled={parserState.status === "parsing"}
                                >
                                  {parserState.status === "parsing" ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Play className="w-4 h-4" />
                                  )}
                                  Parse XML
                                </Button>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Processed View */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full overflow-hidden">
              {/* Right Panel Status Bar - Display mode and content info */}
              <div
                id="right-status-bar"
                className="border-b bg-background p-3 h-14 flex-shrink-0"
              >
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-2">
                    {displayMode === "tree" ? (
                      <TreePine className="w-4 h-4 text-green-600" />
                    ) : (
                      <Brackets className="w-4 h-4 text-purple-600" />
                    )}
                    <h3 className="font-medium text-sm">
                      {displayMode === "beautified" && "Beautified XML"}
                      {displayMode === "tree" && "XML Tree"}
                      {displayMode === "compressed" && "Compressed XML"}
                      {displayMode === "json" && "JSON Format"}
                    </h3>
                    {elements.length > 0 && displayMode === "tree" && (
                      <Badge variant="outline" className="text-xs">
                        {elements.length} elements
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel Toolbar - Mode selection and action controls */}
              <div
                id="right-toolbar"
                className="border-b bg-muted/20 p-3 h-12 flex-shrink-0"
              >
                <div className="flex items-center gap-2 h-full">
                  <div className="flex items-center border rounded-md p-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={displayMode === "beautified"}
                            onPressedChange={() => setDisplayMode("beautified")}
                            size="sm"
                            className={`h-6 w-6 p-0 ${
                              displayMode === "beautified"
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : ""
                            }`}
                          >
                            <Brackets className="w-3 h-3" />
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Beautified XML</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={displayMode === "tree"}
                            onPressedChange={() => setDisplayMode("tree")}
                            size="sm"
                            className={`h-6 w-6 p-0 ${
                              displayMode === "tree"
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : ""
                            }`}
                          >
                            <TreePine className="w-3 h-3" />
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tree structure</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={displayMode === "compressed"}
                            onPressedChange={() => setDisplayMode("compressed")}
                            size="sm"
                            className={`h-6 w-6 p-0 ${
                              displayMode === "compressed"
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : ""
                            }`}
                          >
                            <Minimize2 className="w-3 h-3" />
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Compressed XML (with wrapping)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={displayMode === "json"}
                            onPressedChange={() => setDisplayMode("json")}
                            size="sm"
                            className={`h-6 w-6 p-0 ${
                              displayMode === "json"
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : ""
                            }`}
                          >
                            <FileJson className="w-3 h-3" />
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>JSON format</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {displayMode === "tree" && (
                    <>
                      <Separator orientation="vertical" className="h-6" />
                      <div className="relative flex-1 max-w-48">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="pl-6 h-7 text-xs"
                        />
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const allElementIds = elements.map((e) => e.id);
                                setExpandedNodes(new Set(allElementIds));
                              }}
                              className="h-7 w-7 p-0"
                            >
                              <ExpandIcon className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Expand all</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedNodes(new Set())}
                              className="h-7 w-7 p-0"
                            >
                              <ShrinkIcon className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Collapse all</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  )}

                  {/* Add Copy/Download buttons to the right side */}
                  <div className="flex items-center gap-1 ml-auto">
                    <Separator orientation="vertical" className="h-6" />

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleCopy}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            disabled={
                              !fileUpload.content && !fileUpload.originalContent
                            }
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy result</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleDownload}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            disabled={
                              !fileUpload.content && !fileUpload.originalContent
                            }
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download result</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* Breadcrumb Navigation Bar - Independent status bar for element path */}
              {displayMode === "tree" && breadcrumb.length > 0 && (
                <div
                  id="breadcrumb-status-bar"
                  className="border-b bg-accent/20 px-4 py-3 h-14 flex-shrink-0"
                >
                  {/* Breadcrumb Status Bar - Element path navigation */}
                  <div className="flex items-center gap-3 h-full">
                    <span className="text-sm text-muted-foreground font-medium shrink-0">
                      Path:
                    </span>
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink
                            onClick={() => setBreadcrumb([])}
                            className="flex items-center gap-1 text-sm hover:text-primary cursor-pointer"
                          >
                            <Home className="w-4 h-4" />
                            <span>Root</span>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {breadcrumb.map((crumb, index) => (
                          <div key={index} className="flex items-center">
                            <BreadcrumbSeparator className="text-muted-foreground/60 mx-2" />
                            <BreadcrumbItem>
                              {index === breadcrumb.length - 1 ? (
                                <BreadcrumbPage className="text-sm font-medium text-primary">
                                  {crumb}
                                </BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink
                                  className="text-sm hover:text-primary cursor-pointer"
                                  onClick={() =>
                                    setBreadcrumb(
                                      breadcrumb.slice(0, index + 1)
                                    )
                                  }
                                >
                                  {crumb}
                                </BreadcrumbLink>
                              )}
                            </BreadcrumbItem>
                          </div>
                        ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                </div>
              )}

              {/* Right Panel Visualization Area - Processed content display */}
              <div
                id="right-visualization-area"
                className="flex-1 overflow-hidden"
              >
                {getRightPanelContent()}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Status Bar */}
        {parserState.errors.length > 0 && (
          <div className="border-t p-2">
            <Alert variant="destructive" className="mb-0">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                {parserState.errors.length} error(s) occurred during parsing.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
