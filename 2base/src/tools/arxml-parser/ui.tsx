"use client";

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import {
  FileText,
  Upload,
  Search,
  Play,
  Square,
  Trash2,
  Folder,
  FolderOpen,
  FileCode,
  Cpu,
  Zap,
  Settings,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

// Layout
import { ToolLayout } from "@/components/layout/tool-layout";

// Tool components
import { toolInfo } from "./toolInfo";
import { ARXMLStreamParser } from "./lib";
import type {
  ARXMLElement,
  ARXMLElementType,
  ParseOptions,
  ParserState,
  SearchResult,
  PerformanceMetrics,
} from "./lib/types";

interface FileUploadState {
  isDragOver: boolean;
  selectedFile: File | null;
  fileInfo: {
    name: string;
    size: number;
    type: string;
  } | null;
}

export default function ARXMLParser() {
  const navigate = useNavigate();

  // Core state
  const [parser] = useState(() => new ARXMLStreamParser());
  const [elements, setElements] = useState<ARXMLElement[]>([]);
  const [parserState, setParserState] = useState<ParserState>({
    status: "idle",
    progress: 0,
    currentSection: "",
    elementsProcessed: 0,
    memoryUsage: 0,
    errors: [],
    warnings: [],
  });
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    parseTime: 0,
    renderTime: 0,
    memoryPeak: 0,
    nodeCount: 0,
    searchIndexSize: 0,
  });

  // UI state
  const [fileUpload, setFileUpload] = useState<FileUploadState>({
    isDragOver: false,
    selectedFile: null,
    fileInfo: null,
  });
  const [selectedElement, setSelectedElement] = useState<ARXMLElement | null>(
    null
  );
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Parse options
  const [parseOptions, setParseOptions] = useState<ParseOptions>({
    packages: [],
    elementTypes: [],
    maxDepth: 50,
    maxElements: 100000,
    validateSchema: true,
    enableReferences: true,
    memoryLimit: 500 * 1024 * 1024, // 500MB
  });

  // Available element types for filtering
  const elementTypes: { value: ARXMLElementType; label: string }[] = [
    { value: "AR-PACKAGE", label: "AR Package" },
    { value: "SW-COMPONENT-TYPE", label: "SW Component Type" },
    {
      value: "APPLICATION-SW-COMPONENT-TYPE",
      label: "Application SW Component",
    },
    { value: "SERVICE-SW-COMPONENT-TYPE", label: "Service SW Component" },
    { value: "SENDER-RECEIVER-INTERFACE", label: "Sender-Receiver Interface" },
    { value: "CLIENT-SERVER-INTERFACE", label: "Client-Server Interface" },
    { value: "IMPLEMENTATION-DATA-TYPE", label: "Implementation Data Type" },
    {
      value: "APPLICATION-PRIMITIVE-DATA-TYPE",
      label: "Application Primitive Data Type",
    },
  ];

  // File handling
  const handleFileSelect = useCallback((file: File) => {
    console.log("File selected:", file.name, file.size);
    setFileUpload({
      isDragOver: false,
      selectedFile: file,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      console.log("File input change:", file?.name);
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
      const arxmlFile = files.find(
        (file) =>
          file.name.toLowerCase().endsWith(".arxml") ||
          file.name.toLowerCase().endsWith(".xml")
      );

      if (arxmlFile) {
        handleFileSelect(arxmlFile);
      }

      setFileUpload((prev) => ({ ...prev, isDragOver: false }));
    },
    [handleFileSelect]
  );

  const handleFileDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setFileUpload((prev) => ({ ...prev, isDragOver: true }));
  }, []);

  const handleFileDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setFileUpload((prev) => ({ ...prev, isDragOver: false }));
  }, []);

  // Parsing
  const handleStartParsing = useCallback(async () => {
    if (!fileUpload.selectedFile) {
      console.log("No file selected for parsing");
      return;
    }

    console.log("Starting to parse file:", fileUpload.selectedFile.name);

    try {
      await parser.parseFile(
        fileUpload.selectedFile,
        parseOptions,
        (state) => {
          console.log("Parser state update:", state);
          setParserState(state);
        },
        (parsedElements) => {
          console.log(
            "Parsing complete. Elements found:",
            parsedElements.length
          );
          parsedElements.slice(0, 5).forEach((element, index) => {
            console.log(`Element ${index + 1}:`, {
              name: element.name,
              type: element.type,
              path: element.path,
            });
          });
          setElements(parsedElements);
          setMetrics(parser.getMetrics());
        },
        (error) => {
          console.error("Parse error:", error);
          setParserState((prev) => ({
            ...prev,
            status: "error",
            errors: [...prev.errors, error],
          }));
        }
      );
    } catch (error) {
      console.error("Failed to start parsing:", error);
      setParserState((prev) => ({
        ...prev,
        status: "error",
        errors: [
          ...prev.errors,
          {
            id: Date.now().toString(),
            type: "syntax",
            message:
              error instanceof Error ? error.message : "Unknown parsing error",
            severity: "error" as const,
          },
        ],
      }));
    }
  }, [fileUpload.selectedFile, parseOptions, parser]);

  const handleCancelParsing = useCallback(() => {
    parser.cancelParsing();
    setParserState((prev) => ({ ...prev, status: "idle", progress: 0 }));
  }, [parser]);

  const handleClearData = useCallback(() => {
    parser.clearData();
    setElements([]);
    setSelectedElement(null);
    setExpandedNodes(new Set());
    setSearchQuery("");
    setSearchResults([]);
    setFileUpload({
      isDragOver: false,
      selectedFile: null,
      fileInfo: null,
    });
    setParserState({
      status: "idle",
      progress: 0,
      currentSection: "",
      elementsProcessed: 0,
      memoryUsage: 0,
      errors: [],
      warnings: [],
    });
  }, [parser]);

  // Search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        const results = parser.searchElements(query);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    },
    [parser]
  );

  // Tree navigation
  const handleElementSelect = useCallback((element: ARXMLElement) => {
    setSelectedElement(element);
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

  // Build tree structure with proper hierarchy
  const buildTreeStructure = useCallback((elements: ARXMLElement[]) => {
    console.log("buildTreeStructure: Input elements:", elements.length);

    const elementMap = new Map<string, ARXMLElement>();
    const rootElements: ARXMLElement[] = [];

    // Create element map
    elements.forEach((element) => {
      elementMap.set(element.id, element);
    });

    // Build hierarchy
    elements.forEach((element) => {
      if (element.parent) {
        const parent = elementMap.get(element.parent);
        if (parent) {
          if (!parent.children) parent.children = [];
          if (!parent.children.find((child) => child.id === element.id)) {
            parent.children.push(element);
          }
          parent.hasChildren = true;
        } else {
          // Parent not found, treat as root
          rootElements.push(element);
        }
      } else {
        rootElements.push(element);
      }
    });

    console.log(
      "buildTreeStructure: Root elements found:",
      rootElements.length
    );
    rootElements.slice(0, 3).forEach((element, index) => {
      console.log(`Root ${index + 1}:`, {
        name: element.name,
        type: element.type,
        hasChildren: element.hasChildren,
        childrenCount: element.children?.length || 0,
      });
    });

    return rootElements;
  }, []);

  // Render tree structure with indentation
  const renderTreeNode = useCallback(
    (element: ARXMLElement, depth: number = 0) => {
      const isExpanded = expandedNodes.has(element.id);
      const hasChildren =
        element.hasChildren && element.children && element.children.length > 0;
      const isSelected = selectedElement?.id === element.id;

      return (
        <div key={element.id}>
          {/* Current node */}
          <div
            className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-muted/50 transition-colors ${
              isSelected ? "bg-primary/10 border border-primary/20" : ""
            }`}
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
            onClick={() => handleElementSelect(element)}
          >
            {/* Tree connector lines */}
            {depth > 0 && (
              <div
                className="flex items-center"
                style={{
                  marginLeft: `-${depth * 20}px`,
                  width: `${depth * 20}px`,
                }}
              >
                {Array.from({ length: depth }, (_, i) => (
                  <div key={i} className="w-5 h-full flex justify-center">
                    <div className="w-px bg-border h-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Expand/collapse button */}
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

            {/* Icon */}
            <div className="w-4 h-4 flex items-center justify-center">
              {element.type === "AR-PACKAGE" ? (
                hasChildren && isExpanded ? (
                  <FolderOpen className="w-3 h-3 text-blue-500" />
                ) : (
                  <Folder className="w-3 h-3 text-blue-500" />
                )
              ) : (
                <FileText className="w-3 h-3 text-muted-foreground" />
              )}
            </div>

            {/* Element info */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {element.name}
              </span>

              {/* Tags */}
              {element.metadata.tags && element.metadata.tags.length > 0 && (
                <div className="flex gap-1">
                  {element.metadata.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant={tag === "someip" ? "default" : "secondary"}
                      className="text-xs h-4 px-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {element.metadata.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs h-4 px-1">
                      +{element.metadata.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Type badge */}
              <Badge variant="outline" className="text-xs h-4 px-1 ml-auto">
                {element.type}
              </Badge>
            </div>

            {/* Children count */}
            {hasChildren && (
              <span className="text-xs text-muted-foreground ml-2">
                ({element.children?.length})
              </span>
            )}
          </div>

          {/* Children nodes */}
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

  // Render tree structure
  const renderTreeStructure = useCallback(
    (elements: ARXMLElement[]) => {
      console.log(
        "renderTreeStructure: Called with elements:",
        elements.length
      );

      if (elements.length === 0) {
        console.log("renderTreeStructure: No elements to render");
        return (
          <div className="text-center py-4 text-muted-foreground">
            No elements to display
          </div>
        );
      }

      const rootElements = buildTreeStructure(elements);
      console.log(
        "renderTreeStructure: Rendering root elements:",
        rootElements.length
      );

      if (rootElements.length === 0) {
        console.log(
          "renderTreeStructure: No root elements found, showing all as flat list"
        );
        // If no proper hierarchy, show elements as flat list
        return (
          <div className="space-y-0">
            {elements
              .slice(0, 100)
              .map((element) => renderTreeNode(element, 0))}
          </div>
        );
      }

      return (
        <div className="space-y-0">
          {rootElements
            .slice(0, 100)
            .map((element) => renderTreeNode(element, 0))}
        </div>
      );
    },
    [buildTreeStructure, renderTreeNode]
  );

  // Window controls
  const handleClose = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleMinimize = useCallback(() => {
    console.log("Minimize not implemented");
  }, []);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Filter elements
  const displayElements = searchQuery
    ? searchResults.map((r) => r.element)
    : elements;

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format memory usage
  const formatMemory = (bytes: number): string => {
    return formatFileSize(bytes);
  };

  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      onClose={handleClose}
      onMinimize={handleMinimize}
      onFullscreen={handleFullscreen}
      isFullscreen={isFullscreen}
    >
      <div className="w-full p-6 space-y-6 mt-5">
        {/* Error/Warning Alerts */}
        {parserState.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              {parserState.errors.length} error(s) occurred during parsing.
              Check the status panel for details.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload & Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                File Upload & Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  fileUpload.isDragOver
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDrop={handleFileDrop}
                onDragOver={handleFileDragOver}
                onDragLeave={handleFileDragLeave}
              >
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                {fileUpload.fileInfo ? (
                  <div className="space-y-2">
                    <p className="font-medium">{fileUpload.fileInfo.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(fileUpload.fileInfo.size)}
                    </p>
                    <Button
                      onClick={() =>
                        setFileUpload({
                          isDragOver: false,
                          selectedFile: null,
                          fileInfo: null,
                        })
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm">
                      Drop ARXML file here or click to select
                    </p>
                    <input
                      type="file"
                      accept=".arxml,.xml"
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="file-input"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("file-input")?.click()
                      }
                      className="cursor-pointer"
                    >
                      Select File
                    </Button>
                  </div>
                )}
              </div>

              {/* Parse Options */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Parse Options</Label>

                <div className="space-y-2">
                  <Label htmlFor="memory-limit">Memory Limit (MB)</Label>
                  <Input
                    id="memory-limit"
                    type="number"
                    value={Math.round(parseOptions.memoryLimit / (1024 * 1024))}
                    onChange={(e) =>
                      setParseOptions((prev) => ({
                        ...prev,
                        memoryLimit: parseInt(e.target.value) * 1024 * 1024,
                      }))
                    }
                    min={50}
                    max={2000}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Element Types Filter</Label>
                  <ScrollArea className="h-32 border rounded-md p-2">
                    {elementTypes.map((type) => (
                      <div
                        key={type.value}
                        className="flex items-center space-x-2 py-1"
                      >
                        <Checkbox
                          checked={parseOptions.elementTypes.includes(
                            type.value
                          )}
                          onCheckedChange={(checked) => {
                            setParseOptions((prev) => ({
                              ...prev,
                              elementTypes: checked
                                ? [...prev.elementTypes, type.value]
                                : prev.elementTypes.filter(
                                    (t) => t !== type.value
                                  ),
                            }));
                          }}
                        />
                        <label className="text-sm">{type.label}</label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={parseOptions.validateSchema}
                    onCheckedChange={(checked) =>
                      setParseOptions((prev) => ({
                        ...prev,
                        validateSchema: !!checked,
                      }))
                    }
                  />
                  <Label>Validate AUTOSAR Schema</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={parseOptions.enableReferences}
                    onCheckedChange={(checked) =>
                      setParseOptions((prev) => ({
                        ...prev,
                        enableReferences: !!checked,
                      }))
                    }
                  />
                  <Label>Enable Reference Resolution</Label>
                </div>
              </div>

              {/* Parse Controls */}
              <div className="space-y-2">
                {parserState.status === "parsing" ? (
                  <div className="space-y-2">
                    <Progress value={parserState.progress} className="w-full" />
                    <p className="text-xs text-muted-foreground">
                      {parserState.currentSection}
                    </p>
                    <Button
                      onClick={handleCancelParsing}
                      variant="destructive"
                      className="w-full"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Cancel Parsing
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleStartParsing}
                    disabled={!fileUpload.selectedFile}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Parsing
                  </Button>
                )}

                <Button
                  onClick={handleClearData}
                  variant="outline"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hierarchy Tree Panel - Now Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                ARXML Hierarchy Tree
                <Badge variant="outline">
                  {displayElements.length} elements
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search elements, packages, services (e.g., 'someip', 'interface')..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tree View with Directory Structure */}
              <ScrollArea className="h-[500px]">
                {displayElements.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {parserState.status === "idle" ? (
                      <div className="space-y-2">
                        <FileCode className="w-12 h-12 mx-auto opacity-50" />
                        <p className="text-lg font-medium">
                          No ARXML file loaded
                        </p>
                        <p className="text-sm">
                          Upload and parse an ARXML file to view hierarchy
                        </p>
                      </div>
                    ) : parserState.status === "parsing" ? (
                      <div className="space-y-2">
                        <div className="w-8 h-8 mx-auto animate-spin border-2 border-primary border-t-transparent rounded-full" />
                        <p>Parsing ARXML file...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p>No elements found in the file</p>
                        <p className="text-sm">
                          Try adjusting the element type filters
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-0">
                    {renderTreeStructure(displayElements)}
                    {displayElements.length > 100 && (
                      <div className="text-center py-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          Showing first 100 of {displayElements.length} elements
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Load More
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Selected Element Info */}
              {selectedElement && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{selectedElement.name}</h4>
                        <Badge variant="secondary">
                          {selectedElement.type}
                        </Badge>
                      </div>
                      {selectedElement.metadata.description && (
                        <p className="text-sm text-muted-foreground">
                          {selectedElement.metadata.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Line {selectedElement.metadata.lineNumber}</span>
                        <span>•</span>
                        <span>
                          {selectedElement.children?.length || 0} children
                        </span>
                        {selectedElement.metadata.tags &&
                          selectedElement.metadata.tags.length > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex gap-1">
                                {selectedElement.metadata.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs h-4"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                      </div>
                      <p className="text-xs text-muted-foreground/70 break-all">
                        {selectedElement.path}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>Memory: {formatMemory(parserState.memoryUsage)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Parse Time: {metrics.parseTime.toFixed(0)}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                <span>Elements: {metrics.nodeCount}</span>
              </div>
              <div className="flex items-center gap-2">
                {parserState.errors.length > 0 ? (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <span>
                  {parserState.errors.length} errors,{" "}
                  {parserState.warnings.length} warnings
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Status: {parserState.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help & Tips */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>
                  Large files are processed in background workers for better
                  performance
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔍</span>
                <span>
                  Use search to quickly find elements by name, type, or
                  attributes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>
                  Enable selective loading to reduce memory usage for large
                  files
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
