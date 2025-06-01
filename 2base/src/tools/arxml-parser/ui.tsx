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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import {
  FileText,
  Upload,
  Search,
  Play,
  Trash2,
  Folder,
  FolderOpen,
  FileCode,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Hash,
  Code,
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
import type { XMLElement, ParseOptions, ParserState } from "./lib/types";

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

  // Parse options
  const [parseOptions] = useState<ParseOptions>({
    packages: [],
    elementTypes: [],
    maxDepth: 50,
    maxElements: 100000,
    validateSchema: true,
    enableReferences: true,
    memoryLimit: 500 * 1024 * 1024,
  });

  // Improved XML beautification that preserves and enhances indentation
  const getBeautifiedXML = useCallback((content: string): string => {
    try {
      // First, try to parse and reformat
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, "text/xml");

      // Check for parsing errors
      const parseErrors = xmlDoc.getElementsByTagName("parsererror");
      if (parseErrors.length > 0) {
        // If parsing fails, return manually formatted content
        return formatXMLManually(content);
      }

      const serializer = new XMLSerializer();
      const xmlString = serializer.serializeToString(xmlDoc);

      return formatXMLManually(xmlString);
    } catch {
      // Fallback to manual formatting
      return formatXMLManually(content);
    }
  }, []);

  const formatXMLManually = (content: string): string => {
    const formatted = content.replace(/></g, ">\n<");
    const lines = formatted.split("\n");
    let indentLevel = 0;
    const indentSize = 2;

    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";

        // Decrease indent for closing tags
        if (trimmed.startsWith("</")) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        const indented = " ".repeat(indentLevel * indentSize) + trimmed;

        // Increase indent for opening tags (but not self-closing)
        if (
          trimmed.startsWith("<") &&
          !trimmed.startsWith("</") &&
          !trimmed.endsWith("/>") &&
          !trimmed.startsWith("<?") &&
          !trimmed.startsWith("<!--")
        ) {
          indentLevel++;
        }

        return indented;
      })
      .filter((line) => line.trim())
      .join("\n");
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

        // Auto-parse if enabled and file is not too large (< 10MB)
        if (autoParseEnabled && file.size < 10 * 1024 * 1024) {
          setTimeout(() => {
            handleStartParsing(file);
          }, 100);
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

  // Parsing
  const handleStartParsing = useCallback(
    async (file?: File) => {
      const targetFile = file || fileUpload.selectedFile;
      if (!targetFile) return;

      try {
        await parser.parseFile(
          targetFile,
          parseOptions,
          (state) => setParserState(state),
          (parsedElements) => {
            setElements(parsedElements);
          },
          (error) => {
            setParserState((prev) => ({
              ...prev,
              status: "error",
              errors: [...prev.errors, error],
            }));
          }
        );
      } catch (error) {
        console.error("Failed to start parsing:", error);
      }
    },
    [fileUpload.selectedFile, parseOptions, parser]
  );

  const handleClearData = useCallback(() => {
    parser.clearData();
    setElements([]);
    setSelectedElement(null);
    setExpandedNodes(new Set());
    setSearchQuery("");
    setBreadcrumb([]);
    setFileUpload({
      isDragOver: false,
      selectedFile: null,
      fileInfo: null,
      content: "",
      originalContent: "",
    });
  }, [parser]);

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
    return content.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
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
            className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-muted/50 transition-colors ${
              isSelected ? "bg-primary/10 border border-primary/20" : ""
            }`}
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
            onClick={() => handleElementSelect(element)}
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) {
                  handleNodeToggle(element.id);
                }
              }}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )
              ) : (
                <div className="w-3 h-3" />
              )}
            </Button>

            <div className="w-4 h-4 flex items-center justify-center">
              {element.type === "ELEMENT" ? (
                hasChildren && isExpanded ? (
                  <FolderOpen className="w-3 h-3 text-blue-500" />
                ) : (
                  <Folder className="w-3 h-3 text-blue-500" />
                )
              ) : element.type === "TEXT" ? (
                <FileText className="w-3 h-3 text-green-500" />
              ) : element.type === "COMMENT" ? (
                <Hash className="w-3 h-3 text-gray-500" />
              ) : (
                <Code className="w-3 h-3 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {element.name}
              </span>
              <Badge variant="outline" className="text-xs h-4 px-1 ml-auto">
                {element.type}
              </Badge>
            </div>

            {hasChildren && (
              <span className="text-xs text-muted-foreground ml-2">
                ({element.children?.length})
              </span>
            )}
          </div>

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
            <div key={index} className="flex hover:bg-muted/30">
              {showLineNumbers && (
                <span className="text-muted-foreground text-xs w-12 flex-shrink-0 text-right pr-4 select-none border-r mr-4">
                  {index + 1}
                </span>
              )}
              <span className="flex-1 whitespace-pre">{line || " "}</span>
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
        return renderSourceCode(getBeautifiedXML(sourceContent));
      case "compressed":
        return renderSourceCode(getCompressedXML(sourceContent));
      case "json":
        return renderSourceCode(convertToJSON(sourceContent));
      case "tree":
        return elements.length > 0 ? (
          <div className="space-y-0">
            {elements
              .slice(0, 100)
              .map((element) => renderTreeNode(element, 0))}
          </div>
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

  const handleCopy = useCallback(() => {
    let content: string;
    const sourceContent = fileUpload.originalContent || fileUpload.content;

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

    navigator.clipboard.writeText(content);
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

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <div className="flex flex-col h-full">
              {/* Left Panel Toolbar - All controls in one place */}
              <div className="border-b bg-background p-3 h-14 flex-shrink-0">
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

                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={showLineNumbers}
                            onPressedChange={setShowLineNumbers}
                            size="sm"
                            className="h-7 w-7 p-0"
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
                            className="h-7 w-7 p-0"
                          >
                            <Zap className="w-3 h-3" />
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Auto parse on file load</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {!autoParseEnabled && fileUpload.selectedFile && (
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
                            <p>Parse XML file</p>
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
                            disabled={!fileUpload.originalContent}
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
                            disabled={!fileUpload.originalContent}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download source</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {fileUpload.fileInfo && (
                      <>
                        <Separator orientation="vertical" className="h-6" />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleClearData}
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Clear file</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* File Info and Display Options Section */}
              <div className="border-b bg-muted/20 p-3 h-12 flex-shrink-0">
                <div className="flex items-center gap-2 h-full">
                  {fileUpload.fileInfo ? (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <FileText className="w-4 h-4 text-green-600" />
                        <div className="text-sm">
                          <span className="font-medium">
                            {fileUpload.fileInfo.name}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            ({(fileUpload.fileInfo.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      </div>

                      {parserState.status === "parsing" && (
                        <div className="flex items-center gap-2">
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
              </div>

              {/* Source Content with Integrated Upload */}
              <div className="flex-1 relative">
                <div
                  className={`absolute inset-0 ${
                    fileUpload.isDragOver
                      ? "bg-blue-50 dark:bg-blue-950/20"
                      : ""
                  }`}
                  onDrop={handleFileDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setFileUpload((prev) => ({ ...prev, isDragOver: true }));
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setFileUpload((prev) => ({ ...prev, isDragOver: false }));
                  }}
                >
                  {fileUpload.originalContent ? (
                    <ScrollArea className="h-full">
                      <div className="p-4">
                        {/* Source code */}
                        {renderSourceCode(fileUpload.originalContent)}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div
                      className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-colors ${
                        fileUpload.isDragOver
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                          : "hover:bg-muted/20"
                      }`}
                      onClick={() =>
                        document.getElementById("file-input")?.click()
                      }
                    >
                      <div className="text-center max-w-md mx-auto p-12">
                        <Upload className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Upload XML File
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Drop your XML file here or click anywhere to browse
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Processed View */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full">
              {/* Right Panel Toolbar - Same height as left */}
              <div className="border-b bg-background p-3 h-14 flex-shrink-0">
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

              {/* Mode Selection and Controls Section */}
              <div className="border-b bg-muted/20 p-3 h-12 flex-shrink-0">
                <div className="flex items-center gap-2 h-full">
                  <div className="flex items-center border rounded-md p-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={displayMode === "beautified"}
                            onPressedChange={() => setDisplayMode("beautified")}
                            size="sm"
                            className="h-6 w-6 p-0"
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
                            className="h-6 w-6 p-0"
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
                            className="h-6 w-6 p-0"
                          >
                            <Minimize2 className="w-3 h-3" />
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Compressed XML</p>
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
                            className="h-6 w-6 p-0"
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

                {/* Breadcrumb for selected element */}
                {displayMode === "tree" && breadcrumb.length > 0 && (
                  <div className="mt-2">
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink onClick={() => setBreadcrumb([])}>
                            <Home className="w-3 h-3" />
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {breadcrumb.map((crumb, index) => (
                          <div key={index} className="flex items-center">
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              {index === breadcrumb.length - 1 ? (
                                <BreadcrumbPage className="text-xs">
                                  {crumb}
                                </BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink
                                  className="text-xs"
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
                )}
              </div>

              {/* Processed Content */}
              <ScrollArea className="flex-1">
                <div className="p-4">{getRightPanelContent()}</div>
              </ScrollArea>
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
