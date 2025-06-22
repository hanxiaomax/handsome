"use client";

// Framework UI Components
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// Icons
import { FileCode, AlertCircle, TreePine, Brackets } from "lucide-react";

// Layout
import { ToolWrapper } from "@/components/common/tool-wrapper";

// Tool Configuration
import { toolInfo } from "./toolInfo";

// Business Logic (Hooks)
import { useXMLParserState, useXMLParserLogic } from "./lib";

// UI Components
import {
  LeftPanelToolbar,
  RightPanelToolbar,
  SourceCodeDisplay,
  TreeView,
  BreadcrumbNavigation,
  InputModeSelector,
} from "./components";

export default function XMLParser() {
  // State Management Hook
  const { state: uiState, actions: uiActions } = useXMLParserState();

  // Business Logic Hook
  const { elements, parserState, computed, handlers } = useXMLParserLogic(
    uiState,
    uiActions
  );

  // Get right panel content based on display mode
  const getRightPanelContent = () => {
    if (!computed.hasContent) {
      return null;
    }

    switch (uiState.displayMode) {
      case "beautified":
        return (
          <SourceCodeDisplay
            content={computed.beautifiedContent}
            showLineNumbers={uiState.showLineNumbers}
          />
        );
      case "compressed":
        return (
          <SourceCodeDisplay
            content={computed.compressedContent}
            showLineNumbers={uiState.showLineNumbers}
          />
        );
      case "json":
        return (
          <SourceCodeDisplay
            content={computed.jsonContent}
            showLineNumbers={uiState.showLineNumbers}
          />
        );
      case "tree":
        return (
          <TreeView
            elements={elements}
            expandedNodes={uiState.expandedNodes}
            selectedElement={uiState.selectedElement}
            isLoading={parserState.status === "parsing"}
            onElementSelect={handlers.onElementSelect}
            onNodeToggle={handlers.onNodeToggle}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ToolWrapper
      toolInfo={toolInfo}
      state={{
        parserState,
        fileUpload: uiState.fileUpload,
        elements,
        selectedElement: uiState.selectedElement,
        displayMode: uiState.displayMode,
        inputMode: uiState.inputMode,
        showLineNumbers: uiState.showLineNumbers,
        autoParseEnabled: uiState.autoParseEnabled,
      }}
    >
      {/* Main Tool Layout */}
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
                    <FileCode className="w-4 h-4 text-primary" />
                    <h3 className="font-medium text-sm">Input XML</h3>
                    {uiState.fileUpload.fileInfo && (
                      <Badge variant="secondary" className="text-xs">
                        {uiState.fileUpload.fileInfo.name}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    {uiState.fileUpload.fileInfo ? (
                      <span className="text-sm">
                        {(uiState.fileUpload.fileInfo.size / 1024).toFixed(1)}{" "}
                        KB
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
                  fileInfo={uiState.fileUpload.fileInfo}
                  parserState={parserState}
                  showLineNumbers={uiState.showLineNumbers}
                  onToggleLineNumbers={uiActions.setShowLineNumbers}
                  autoParseEnabled={uiState.autoParseEnabled}
                  onToggleAutoParse={uiActions.setAutoParseEnabled}
                  canParse={computed.canParse}
                  onParse={handlers.onParse}
                  onCopy={handlers.onCopy}
                  onDownload={handlers.onDownload}
                  canClear={computed.canClear}
                  onClear={handlers.onClear}
                  hasContent={computed.hasContent}
                  inputMode={uiState.inputMode}
                />
              </div>

              {/* Left Panel Content */}
              <div
                id="left-visualization-area"
                className="flex-1 relative overflow-hidden"
              >
                {computed.hasContent ? (
                  <SourceCodeDisplay
                    content={
                      uiState.inputMode === "text"
                        ? uiState.textInput
                        : uiState.fileUpload.originalContent
                    }
                    showLineNumbers={uiState.showLineNumbers}
                  />
                ) : (
                  <InputModeSelector
                    inputMode={uiState.inputMode}
                    onInputModeChange={uiActions.setInputMode}
                    fileUpload={uiState.fileUpload}
                    textInput={uiState.textInput}
                    onTextInputChange={uiActions.setTextInput}
                    onFileSelect={handlers.onFileSelect}
                    onFileInputChange={handlers.onFileInputChange}
                    onFileDrop={handlers.onFileDrop}
                    onDragOver={handlers.onDragOver}
                    onDragLeave={handlers.onDragLeave}
                    onParse={handlers.onParse}
                    autoParseEnabled={uiState.autoParseEnabled}
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
                    {uiState.displayMode === "tree" ? (
                      <TreePine className="w-4 h-4 text-primary" />
                    ) : (
                      <Brackets className="w-4 h-4 text-accent-foreground" />
                    )}
                    <h3 className="font-medium text-sm">
                      {uiState.displayMode === "beautified" && "Beautified XML"}
                      {uiState.displayMode === "tree" && "XML Tree"}
                      {uiState.displayMode === "compressed" && "Compressed XML"}
                      {uiState.displayMode === "json" && "JSON Format"}
                    </h3>
                    {elements.length > 0 && uiState.displayMode === "tree" && (
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
                  displayMode={uiState.displayMode}
                  onDisplayModeChange={uiActions.setDisplayMode}
                  searchQuery={uiState.searchQuery}
                  onSearchChange={handlers.onSearch}
                  onExpandAll={handlers.onExpandAll}
                  onCollapseAll={handlers.onCollapseAll}
                  onCopy={handlers.onCopy}
                  onDownload={handlers.onDownload}
                  hasContent={computed.hasContent}
                />
              </div>

              {/* Breadcrumb Navigation */}
              <BreadcrumbNavigation
                breadcrumb={uiState.breadcrumb}
                onBreadcrumbClick={uiActions.setBreadcrumb}
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
