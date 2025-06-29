/**
 * XML Parser State Management Hook
 *
 * Manages all core state for the XML parser tool
 */

import { useState, useCallback } from "react";
import type { XMLElement } from "../../types";
import type { FileUploadState } from "../fileHandler";

export interface XMLParserUIState {
  // Display settings
  displayMode: "beautified" | "tree" | "compressed" | "json";
  showLineNumbers: boolean;
  inputMode: "file" | "text";
  autoParseEnabled: boolean;

  // UI interactions
  selectedElement: XMLElement | null;
  expandedNodes: Set<string>;
  searchQuery: string;
  breadcrumb: string[];

  // Input content
  textInput: string;
  fileUpload: FileUploadState;

  // Edit tracking
  hasUserEdited: boolean;
  originalTextInput: string;
}

const initialState: XMLParserUIState = {
  displayMode: "beautified",
  showLineNumbers: true,
  inputMode: "text",
  autoParseEnabled: true,
  selectedElement: null,
  expandedNodes: new Set(),
  searchQuery: "",
  breadcrumb: [],
  textInput: "",
  fileUpload: {
    isDragOver: false,
    selectedFile: null,
    fileInfo: null,
    content: "",
    originalContent: "",
  },
  hasUserEdited: false,
  originalTextInput: "",
};

export function useXMLParserState() {
  const [state, setState] = useState<XMLParserUIState>(initialState);

  const actions = {
    // Display mode actions
    setDisplayMode: useCallback((mode: XMLParserUIState["displayMode"]) => {
      setState((prev) => ({ ...prev, displayMode: mode }));
    }, []),

    setShowLineNumbers: useCallback((show: boolean) => {
      setState((prev) => ({ ...prev, showLineNumbers: show }));
    }, []),

    setInputMode: useCallback((mode: XMLParserUIState["inputMode"]) => {
      setState((prev) => ({ ...prev, inputMode: mode }));
    }, []),

    setAutoParseEnabled: useCallback((enabled: boolean) => {
      setState((prev) => ({ ...prev, autoParseEnabled: enabled }));
    }, []),

    // Selection and navigation actions
    setSelectedElement: useCallback((element: XMLElement | null) => {
      setState((prev) => ({
        ...prev,
        selectedElement: element,
        breadcrumb: element ? element.path.split("/").filter(Boolean) : [],
      }));
    }, []),

    toggleExpandedNode: useCallback((elementId: string) => {
      setState((prev) => {
        const newSet = new Set(prev.expandedNodes);
        if (newSet.has(elementId)) {
          newSet.delete(elementId);
        } else {
          newSet.add(elementId);
        }
        return { ...prev, expandedNodes: newSet };
      });
    }, []),

    expandAllNodes: useCallback((elementIds: string[]) => {
      setState((prev) => ({
        ...prev,
        expandedNodes: new Set(elementIds),
      }));
    }, []),

    collapseAllNodes: useCallback(() => {
      setState((prev) => ({ ...prev, expandedNodes: new Set() }));
    }, []),

    setSearchQuery: useCallback((query: string) => {
      setState((prev) => ({ ...prev, searchQuery: query }));
    }, []),

    setBreadcrumb: useCallback((breadcrumb: string[]) => {
      setState((prev) => ({ ...prev, breadcrumb }));
    }, []),

    // Input content actions
    setTextInput: useCallback((text: string) => {
      setState((prev) => {
        // Check if user has edited the content
        const hasEdited = text !== prev.originalTextInput;
        return {
          ...prev,
          textInput: text,
          hasUserEdited: hasEdited,
        };
      });
    }, []),

    setFileUpload: useCallback((fileUpload: Partial<FileUploadState>) => {
      setState((prev) => ({
        ...prev,
        fileUpload: { ...prev.fileUpload, ...fileUpload },
      }));
    }, []),

    // Edit tracking actions
    setOriginalTextInput: useCallback((text: string) => {
      setState((prev) => ({
        ...prev,
        originalTextInput: text,
        hasUserEdited: false,
      }));
    }, []),

    resetEditState: useCallback(() => {
      setState((prev) => ({
        ...prev,
        hasUserEdited: false,
        originalTextInput: prev.textInput,
      }));
    }, []),

    // Reset actions
    clearContent: useCallback(() => {
      setState((prev) => ({
        ...prev,
        textInput: "",
        fileUpload: initialState.fileUpload,
        selectedElement: null,
        expandedNodes: new Set(),
        searchQuery: "",
        breadcrumb: [],
        hasUserEdited: false,
        originalTextInput: "",
      }));
    }, []),

    resetState: useCallback(() => {
      setState(initialState);
    }, []),
  };

  return { state, actions };
}
