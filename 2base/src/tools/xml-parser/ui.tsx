"use client";

import { useState, useCallback } from "react";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";

// Icons
import { FileCode, AlertCircle, TreePine, Brackets } from "lucide-react";

// Layout
import { ToolWrapper } from "@/components/common/tool-wrapper";

// Tool components
import { toolInfo } from "./toolInfo";
import { XMLStreamParser } from "./lib";
import { xmlParser } from "./lib/xmlParser";
import type { XMLElement, ParserState } from "./types";

// Local components
import {
  LeftPanelToolbar,
  RightPanelToolbar,
  SourceCodeDisplay,
  TreeView,
  BreadcrumbNavigation,
  InputModeSelector,
} from "./components";

interface FileUploadState {
  isDragOver: boolean;
  selectedFile: File | null;
  fileInfo: {
    name: string;
    size: number;
    type: string;
  } | null;
  content: string;
  originalContent: string;
}

type DisplayMode = "beautified" | "tree" | "compressed" | "json";

export default function XMLParser() {
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

  // XML processing functions
  const getBeautifiedXML = useCallback((content: string): string => {
    try {
      const normalized = content
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\n\s*\n/g, "\n")
        .trim();
      return formatXMLManually(normalized);
    } catch (error) {
      console.warn("XML beautification error:", error);
      return content.replace(/></g, ">\n<");
    }
  }, []);

  const formatXMLManually = (content: string): string => {
    let formatted = content.replace(/></g, ">\n<").replace(/^\s+|\s+$/g, "");
    formatted = formatted.replace(/>\s*([^<>\s][^<]*?)\s*</g, ">$1<");

    const lines = formatted.split("\n");
    let indentLevel = 0;
    const indentSize = 2;
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) continue;

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

      const mixedContentMatch = trimmed.match(/^(<[^>]+>)([^<]+)(<\/[^>]+>)$/);
      if (mixedContentMatch) {
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
        continue;
      }

      if (isClosingTag) {
        indentLevel = Math.max(0, indentLevel - 1);
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
        continue;
      }

      if (isSelfClosingTag || isProcessingInstruction || isComment || isDTD) {
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
        continue;
      }

      if (isOpeningTag) {
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
        indentLevel++;
        continue;
      }

      if (trimmed.length > 0) {
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
      }
    }

    return result.join("\n");
  };

  const getCompressedXML = useCallback((content: string): string => {
    const compressed = content
      .replace(/>\s+</g, "><")
      .replace(/\s+/g, " ")
      .trim();

    const maxLineLength = 120;
    const lines: string[] = [];
    let currentLine = "";

    const parts = compressed.split(/(<[^>]*>)/);

    for (const part of parts) {
      if (!part) continue;

      if (currentLine.length + part.length > maxLineLength) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = part;
        } else {
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

  // File handling
  const handleFileSelect = useCallback(
    async (file: File) => {
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
          content: getBeautifiedXML(content),
          originalContent: content,
        });

        setInputMode("file");

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

  // Parsing
  const handleStartParsing = useCallback(
    async (file?: File) => {
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

        const treeNodes = xmlParser.parseXMLToTree(content);

        setParserState((prev) => ({
          ...prev,
          progress: 70,
          currentSection: "Converting to elements...",
        }));

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

  // Content rendering
  const getRightPanelContent = useCallback(() => {
    if (
      !fileUpload.content &&
      !fileUpload.originalContent &&
      !textInput.trim()
    ) {
      return null;
    }

    const sourceContent = fileUpload.originalContent || textInput;

    switch (displayMode) {
      case "beautified":
        return (
          <SourceCodeDisplay
            content={getBeautifiedXML(sourceContent)}
            showLineNumbers={showLineNumbers}
          />
        );
      case "compressed":
        return (
          <SourceCodeDisplay
            content={getCompressedXML(sourceContent)}
            showLineNumbers={showLineNumbers}
          />
        );
      case "json":
        return (
          <SourceCodeDisplay
            content={convertToJSON(sourceContent)}
            showLineNumbers={showLineNumbers}
          />
        );
      case "tree":
        return (
          <TreeView
            elements={elements}
            expandedNodes={expandedNodes}
            selectedElement={selectedElement}
            isLoading={parserState.status === "parsing"}
            onElementSelect={handleElementSelect}
            onNodeToggle={handleNodeToggle}
          />
        );
      default:
        return null;
    }
  }, [
    fileUpload.content,
    fileUpload.originalContent,
    textInput,
    displayMode,
    elements,
    expandedNodes,
    selectedElement,
    parserState.status,
    showLineNumbers,
    getBeautifiedXML,
    getCompressedXML,
    convertToJSON,
    handleElementSelect,
    handleNodeToggle,
  ]);

  // Copy and download handlers
  const handleCopy = useCallback(async () => {
    if (
      !fileUpload.content &&
      !fileUpload.originalContent &&
      !textInput.trim()
    ) {
      toast.error("No content to copy", {
        description: "Please upload a file or enter text first",
      });
      return;
    }

    let content: string;
    const sourceContent = fileUpload.originalContent || textInput;

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

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
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
    textInput,
    displayMode,
    elements,
    getBeautifiedXML,
    getCompressedXML,
    convertToJSON,
  ]);

  const handleDownload = useCallback(() => {
    if (!fileUpload.content && !fileUpload.originalContent && !textInput.trim())
      return;

    let content: string;
    let filename: string;
    let mimeType: string;
    const sourceContent = fileUpload.originalContent || textInput;

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
    textInput,
    displayMode,
    elements,
    getBeautifiedXML,
    getCompressedXML,
    convertToJSON,
  ]);

  return (
    <ToolWrapper
      toolInfo={toolInfo}
      state={{
        parserState,
        fileUpload,
        elements,
        selectedElement,
        displayMode,
        inputMode,
        showLineNumbers,
        autoParseEnabled,
      }}
    >
      <div className="flex flex-col h-full mt-12">
        {/* Resizable Panel Group */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - Source XML */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full overflow-hidden">
              {/* Left Panel Status Bar */}
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

              {/* Left Panel Toolbar */}
              <div
                id="left-toolbar"
                className="border-b bg-muted/20 p-3 h-12 flex-shrink-0"
              >
                <LeftPanelToolbar
                  fileInfo={fileUpload.fileInfo}
                  parserState={parserState}
                  showLineNumbers={showLineNumbers}
                  onToggleLineNumbers={setShowLineNumbers}
                  autoParseEnabled={autoParseEnabled}
                  onToggleAutoParse={setAutoParseEnabled}
                  canParse={
                    !autoParseEnabled &&
                    (inputMode === "file"
                      ? !!fileUpload.selectedFile
                      : !!textInput.trim())
                  }
                  onParse={() => handleStartParsing()}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  canClear={
                    inputMode === "file"
                      ? !!fileUpload.fileInfo
                      : !!textInput.trim()
                  }
                  onClear={() => {
                    if (inputMode === "file") {
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
                      setTextInput("");
                      toast.success("Text cleared!", {
                        description: "Text input has been cleared",
                      });
                    }
                    setElements([]);
                    setSelectedElement(null);
                    setExpandedNodes(new Set());
                    setSearchQuery("");
                    setBreadcrumb([]);
                  }}
                  hasContent={
                    inputMode === "file"
                      ? !!fileUpload.originalContent
                      : !!textInput.trim()
                  }
                  inputMode={inputMode}
                />
              </div>

              {/* Left Panel Content */}
              <div
                id="left-visualization-area"
                className="flex-1 relative overflow-hidden"
              >
                {fileUpload.originalContent || textInput.trim() ? (
                  <SourceCodeDisplay
                    content={
                      inputMode === "text"
                        ? textInput
                        : fileUpload.originalContent
                    }
                    showLineNumbers={showLineNumbers}
                  />
                ) : (
                  <InputModeSelector
                    inputMode={inputMode}
                    onInputModeChange={setInputMode}
                    fileUpload={fileUpload}
                    textInput={textInput}
                    onTextInputChange={setTextInput}
                    onFileSelect={handleFileSelect}
                    onFileInputChange={handleFileInputChange}
                    onFileDrop={handleFileDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setFileUpload((prev) => ({ ...prev, isDragOver: true }));
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setFileUpload((prev) => ({ ...prev, isDragOver: false }));
                    }}
                    onParse={() => handleStartParsing()}
                    autoParseEnabled={autoParseEnabled}
                    isLoading={parserState.status === "parsing"}
                  />
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Processed View */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full overflow-hidden">
              {/* Right Panel Status Bar */}
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

              {/* Right Panel Toolbar */}
              <div
                id="right-toolbar"
                className="border-b bg-muted/20 p-3 h-12 flex-shrink-0"
              >
                <RightPanelToolbar
                  displayMode={displayMode}
                  onDisplayModeChange={setDisplayMode}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearch}
                  onExpandAll={() => {
                    const allElementIds = elements.map((e) => e.id);
                    setExpandedNodes(new Set(allElementIds));
                  }}
                  onCollapseAll={() => setExpandedNodes(new Set())}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  hasContent={
                    !!(
                      fileUpload.content ||
                      fileUpload.originalContent ||
                      textInput.trim()
                    )
                  }
                />
              </div>

              {/* Breadcrumb Navigation */}
              <BreadcrumbNavigation
                breadcrumb={breadcrumb}
                onBreadcrumbClick={setBreadcrumb}
              />

              {/* Right Panel Content */}
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
    </ToolWrapper>
  );
}
