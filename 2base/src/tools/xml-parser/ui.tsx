"use client";

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Framework UI Components
import { Badge } from "@/components/ui/badge";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// Icons
import {
  FileCode,
  AlertCircle,
  TreePine,
  Brackets,
  Download,
  FileX,
} from "lucide-react";

// Layout
import { ToolLayout } from "@/components/layout/tool-layout";
import type { CustomToolButton } from "@/components/layout/tool-layout";

// Store hooks
import {
  useMinimizedToolsActions,
  useIsToolMinimized,
  useToolState,
} from "@/stores/minimized-tools-store";
import { useFavoriteActions, useIsFavorite } from "@/stores/favorites-store";

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
  TextInputArea,
  ErrorDisplay,
} from "./components";

export default function XMLParser() {
  const navigate = useNavigate();

  // Standard ToolLayout state management
  const { minimizeTool, restoreTool } = useMinimizedToolsActions();
  const { toggleFavorite } = useFavoriteActions();
  const isFavorite = useIsFavorite(toolInfo.id);
  const isMinimized = useIsToolMinimized(toolInfo.id);
  const savedState = useToolState(toolInfo.id);

  // Tool-specific state management
  const { state: uiState, actions: uiActions } = useXMLParserState();
  const { elements, parserState, computed, handlers } = useXMLParserLogic(
    uiState,
    {
      ...uiActions,
      setTextInput: uiActions.setTextInput,
    }
  );

  // Settings panel state
  const [showSettings, setShowSettings] = useState(false);

  // Standard ToolLayout handlers
  const handleMinimize = useCallback(() => {
    const toolState = {
      displayMode: uiState.displayMode,
      showLineNumbers: uiState.showLineNumbers,
      inputMode: uiState.inputMode,
      autoParseEnabled: uiState.autoParseEnabled,
      textInput: uiState.textInput,
      fileUpload: uiState.fileUpload,
      selectedElement: uiState.selectedElement,
      searchQuery: uiState.searchQuery,
    };
    minimizeTool(toolInfo, toolState);
    navigate("/tools");
  }, [minimizeTool, navigate, uiState]);

  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(toolInfo.id);
  }, [toggleFavorite]);

  const handleShowDocumentation = useCallback(() => {
    toast.info("Documentation", {
      description: "Opening XML Parser documentation...",
    });
    // Could open a modal or navigate to docs
  }, []);

  // Restore state when returning from minimized
  useEffect(() => {
    if (isMinimized && savedState) {
      // Restore tool state from minimized store
      Object.entries(savedState).forEach(([key, value]) => {
        if (
          key in uiActions &&
          typeof uiActions[key as keyof typeof uiActions] === "function"
        ) {
          const actionFn = uiActions[key as keyof typeof uiActions] as (
            value: unknown
          ) => void;
          actionFn(value);
        }
      });
      restoreTool(toolInfo.id);
    }
  }, [isMinimized, savedState, restoreTool, uiActions]);

  // Custom tool buttons
  const customButtons: CustomToolButton[] = [
    {
      id: "export-data",
      icon: Download,
      title: "Export XML Data",
      onClick: handlers.onDownload,
      disabled: !computed.hasContent,
    },
    {
      id: "clear-all",
      icon: FileX,
      title: "Clear All Content",
      onClick: handlers.onClear,
      disabled: !computed.canClear,
      variant: "outline",
    },
  ];

  // Settings panel content
  const settingsContent = (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">
          Display Options
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={uiState.showLineNumbers}
              onChange={(e) => uiActions.setShowLineNumbers(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-foreground">Show line numbers</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={uiState.autoParseEnabled}
              onChange={(e) => uiActions.setAutoParseEnabled(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-foreground">Auto-parse on file load</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">
          Parser Settings
        </h3>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Memory usage: {Math.round(parserState.memoryUsage / 1024 / 1024)}MB
          </div>
          <div className="text-xs text-muted-foreground">
            Elements processed: {parserState.elementsProcessed}
          </div>
          {parserState.errors.length > 0 && (
            <div className="text-xs text-destructive">
              Errors: {parserState.errors.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Get right panel content based on display mode
  const getRightPanelContent = () => {
    // Show error display if there are parsing errors or warnings
    if (parserState.errors.length > 0 || parserState.warnings.length > 0) {
      return (
        <ErrorDisplay
          errors={parserState.errors}
          warnings={parserState.warnings}
          className="h-full flex flex-col"
        />
      );
    }

    if (!computed.hasContent) {
      return (
        <div className="flex items-center justify-center h-full text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              {uiState.displayMode === "tree" ? (
                <TreePine className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Brackets className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Content Available
              </h3>
              <p className="text-muted-foreground">
                Upload an XML file or enter text to see the parsed result
              </p>
            </div>
          </div>
        </div>
      );
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
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      customButtons={customButtons}
      onMinimize={handleMinimize}
      onToggleFavorite={handleToggleFavorite}
      isFavorite={isFavorite}
      onShowDocumentation={handleShowDocumentation}
      rightSidebarContent={showSettings ? settingsContent : undefined}
      rightSidebarTitle="XML Parser Settings"
      rightSidebarDescription="Configure parser options and view statistics"
      isRightSidebarOpen={showSettings}
      onRightSidebarToggle={() => setShowSettings(!showSettings)}
    >
      {/* Main Tool Container - Primary workspace */}
      <div id="xml-parser-main-container" className="flex flex-col h-full">
        {/* Resizable Panel Group */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - Source XML Input */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full overflow-hidden">
              {/* Left Panel Status Bar - XML Editor status */}
              <div
                id="left-status-bar"
                className="border-b bg-background p-3 h-14 flex-shrink-0"
              >
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-primary" />
                    <h3 className="font-medium text-sm text-foreground">
                      XML Editor
                    </h3>
                    {uiState.inputMode === "file" &&
                      uiState.fileUpload.fileInfo && (
                        <Badge variant="secondary" className="text-xs">
                          {uiState.fileUpload.fileInfo.name}
                        </Badge>
                      )}
                    {parserState.status === "parsing" && (
                      <Badge variant="outline" className="text-xs">
                        Parsing... {Math.round(parserState.progress)}%
                      </Badge>
                    )}
                    {computed.hasContent && parserState.status === "complete" && (
                      <Badge variant="secondary" className="text-xs">
                        Ready
                      </Badge>
                    )}
                    {uiState.hasUserEdited && (
                      <Badge variant="outline" className="text-xs">
                        Edited
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    {uiState.inputMode === "file" &&
                    uiState.fileUpload.fileInfo ? (
                      <span className="text-sm">
                        {uiState.fileUpload.fileInfo.name} •{" "}
                        {(uiState.fileUpload.fileInfo.size / 1024).toFixed(1)}{" "}
                        KB
                      </span>
                    ) : computed.hasContent ? (
                      <span className="text-sm">
                        {uiState.textInput.length} characters
                      </span>
                    ) : (
                      <span className="text-sm">Ready for input</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Left Panel Toolbar - Input controls */}
              <div
                id="left-toolbar"
                className="border-b bg-muted/20 p-3 h-12 flex-shrink-0"
              >
                <LeftPanelToolbar
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
                  onFileSelect={() =>
                    document.getElementById("file-input")?.click()
                  }
                  onFileInputChange={handlers.onFileInputChange}
                />
              </div>

              {/* Left Panel Content - Editable text area or file content */}
              <div
                id="left-content-area"
                className="flex-1 overflow-hidden p-4"
              >
                {uiState.inputMode === "file" &&
                uiState.fileUpload.originalContent ? (
                  // Show file content in editable text area
                  <TextInputArea
                    textInput={uiState.fileUpload.originalContent}
                    onTextInputChange={(value) => {
                      // Update the file content when editing
                      uiActions.setFileUpload({
                        ...uiState.fileUpload,
                        originalContent: value,
                        content: value,
                      });
                      // Also update text input for consistency
                      uiActions.setTextInput(value);
                    }}
                    onParse={handlers.onParse}
                    isParsingMode={
                      !uiState.autoParseEnabled || uiState.hasUserEdited
                    }
                    isLoading={parserState.status === "parsing"}
                  />
                ) : (
                  // Show regular text input area
                  <TextInputArea
                    textInput={uiState.textInput}
                    onTextInputChange={handlers.onTextInputChange}
                    onParse={handlers.onParse}
                    isParsingMode={
                      !uiState.autoParseEnabled || uiState.hasUserEdited
                    }
                    isLoading={parserState.status === "parsing"}
                  />
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Processed XML Output */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full overflow-hidden">
              {/* Right Panel Status Bar - Output information */}
              <div
                id="right-status-bar"
                className="border-b bg-background p-3 h-14 flex-shrink-0"
              >
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-2">
                    {parserState.errors.length > 0 ||
                    parserState.warnings.length > 0 ? (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : uiState.displayMode === "tree" ? (
                      <TreePine className="w-4 h-4 text-primary" />
                    ) : (
                      <Brackets className="w-4 h-4 text-primary" />
                    )}
                    <h3 className="font-medium text-sm text-foreground">
                      {parserState.errors.length > 0 ||
                      parserState.warnings.length > 0
                        ? "Validation Results"
                        : uiState.displayMode === "beautified" &&
                          "Beautified XML"}
                      {parserState.errors.length === 0 &&
                        parserState.warnings.length === 0 &&
                        uiState.displayMode === "tree" &&
                        "XML Tree Structure"}
                      {parserState.errors.length === 0 &&
                        parserState.warnings.length === 0 &&
                        uiState.displayMode === "compressed" &&
                        "Compressed XML"}
                      {parserState.errors.length === 0 &&
                        parserState.warnings.length === 0 &&
                        uiState.displayMode === "json" &&
                        "JSON Format"}
                    </h3>
                    {elements.length > 0 &&
                      uiState.displayMode === "tree" &&
                      parserState.errors.length === 0 && (
                        <Badge variant="outline" className="text-xs">
                          {elements.length} elements
                        </Badge>
                      )}
                    {parserState.errors.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {parserState.errors.length} Error
                        {parserState.errors.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    {parserState.warnings.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {parserState.warnings.length} Warning
                        {parserState.warnings.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {parserState.status === "complete" &&
                      elements.length > 0 &&
                      parserState.errors.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Parsed successfully
                        </span>
                      )}
                    {parserState.errors.length > 0 && (
                      <span className="text-xs text-destructive">
                        Validation failed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel Toolbar - Output controls */}
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
                  disabled={parserState.errors.length > 0}
                />
              </div>

              {/* Breadcrumb Navigation - Element path navigation */}
              {uiState.displayMode === "tree" &&
                uiState.breadcrumb.length > 0 &&
                parserState.errors.length === 0 && (
                  <BreadcrumbNavigation
                    breadcrumb={uiState.breadcrumb}
                    onBreadcrumbClick={uiActions.setBreadcrumb}
                  />
                )}

              {/* Right Panel Content - Processed output */}
              <div id="right-content-area" className="flex-1 overflow-hidden">
                {getRightPanelContent()}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ToolLayout>
  );
}
