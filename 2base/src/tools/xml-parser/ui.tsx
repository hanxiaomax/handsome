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

// Tool utilities and components
import { toolInfo } from "./toolInfo";
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
} from "./lib";
import type { XMLElement, FileUploadState, ContentFormat } from "./lib";

// Local components
import {
  LeftPanelToolbar,
  RightPanelToolbar,
  SourceCodeDisplay,
  TreeView,
  BreadcrumbNavigation,
  InputModeSelector,
} from "./components";

type DisplayMode = "beautified" | "tree" | "compressed" | "json";

export default function XMLParser() {
  // XML Parser Hook
  const { elements, parserState, parseXMLContent, searchElements } =
    useXMLParser();

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

  // File handling
  const handleFileSelect = useCallback(
    async (file: File) => {
      try {
        const content = await readFileContent(file);
        const fileInfo = extractFileInfo(file);

        setFileUpload({
          isDragOver: false,
          selectedFile: file,
          fileInfo,
          content: beautifyXML(content),
          originalContent: content,
        });

        setInputMode("file");

        if (shouldAutoParseFile(file, autoParseEnabled)) {
          toast.info("Starting auto-parse...", {
            description: "File loaded successfully, parsing XML content",
          });
          setTimeout(() => {
            parseXMLContent(content, "file");
          }, 100);
        } else if (!autoParseEnabled) {
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
    [autoParseEnabled, parseXMLContent]
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

      setFileUpload((prev) => ({ ...prev, isDragOver: false }));
    },
    [handleFileSelect]
  );

  // Parsing
  const handleStartParsing = useCallback(async () => {
    if (inputMode === "text") {
      if (!textInput.trim()) {
        toast.error("请输入XML内容", {
          description: "文本输入区域不能为空",
        });
        return;
      }
      await parseXMLContent(textInput, "text");
    } else {
      if (!fileUpload.selectedFile) {
        toast.error("请选择文件", {
          description: "需要先上传XML文件",
        });
        return;
      }
      const content = fileUpload.originalContent;
      await parseXMLContent(content, "file");
    }
  }, [
    inputMode,
    textInput,
    fileUpload.selectedFile,
    fileUpload.originalContent,
    parseXMLContent,
  ]);

  // Search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      searchElements(query);
    },
    [searchElements]
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
            content={beautifyXML(sourceContent)}
            showLineNumbers={showLineNumbers}
          />
        );
      case "compressed":
        return (
          <SourceCodeDisplay
            content={compressXML(sourceContent)}
            showLineNumbers={showLineNumbers}
          />
        );
      case "json":
        return (
          <SourceCodeDisplay
            content={convertXMLToJSON(sourceContent)}
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

    try {
      const sourceContent = fileUpload.originalContent || textInput;
      const content = prepareContentForExport(
        displayMode as ContentFormat,
        sourceContent,
        elements,
        {
          beautify: beautifyXML,
          compress: compressXML,
          convertToJSON: convertXMLToJSON,
        }
      );

      await copyToClipboard(content, displayMode);
    } catch (error) {
      // Error handling is done in copyToClipboard function
      console.error("Copy operation failed:", error);
    }
  }, [fileUpload, textInput, displayMode, elements]);

  const handleDownload = useCallback(() => {
    if (
      !fileUpload.content &&
      !fileUpload.originalContent &&
      !textInput.trim()
    ) {
      return;
    }

    try {
      const sourceContent = fileUpload.originalContent || textInput;
      const content = prepareContentForExport(
        displayMode as ContentFormat,
        sourceContent,
        elements,
        {
          beautify: beautifyXML,
          compress: compressXML,
          convertToJSON: convertXMLToJSON,
        }
      );

      const filename = generateFilename(
        fileUpload.fileInfo?.name,
        displayMode as ContentFormat
      );
      const mimeType = getMimeType(displayMode as ContentFormat);

      downloadAsFile(content, filename, mimeType);
    } catch (error) {
      // Error handling is done in downloadAsFile function
      console.error("Download operation failed:", error);
    }
  }, [fileUpload, textInput, displayMode, elements]);

  // Clear functionality
  const handleClear = useCallback(() => {
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
    setSelectedElement(null);
    setExpandedNodes(new Set());
    setSearchQuery("");
    setBreadcrumb([]);
  }, [inputMode]);

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
                  onParse={handleStartParsing}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  canClear={
                    inputMode === "file"
                      ? !!fileUpload.fileInfo
                      : !!textInput.trim()
                  }
                  onClear={handleClear}
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
                    onParse={handleStartParsing}
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
