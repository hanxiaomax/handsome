/**
 * XML Parser Hook
 *
 * Custom React hook that manages XML parsing state and operations
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { XMLStreamParser, xmlParser } from "./index";
import type { XMLElement, ParserState } from "../types";

interface UseXMLParserReturn {
  // State
  parser: XMLStreamParser;
  elements: XMLElement[];
  parserState: ParserState;

  // Actions
  parseXMLContent: (content: string, source: "file" | "text") => Promise<void>;
  clearResults: () => void;
  searchElements: (query: string) => void;
}

export function useXMLParser(): UseXMLParserReturn {
  // Future: can add options parameter for additional parsing behavior

  // Initialize parser instance
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

  /**
   * Parse XML content and update state
   */
  const parseXMLContent = useCallback(
    async (content: string, source: "file" | "text") => {
      if (!content.trim()) {
        toast.error("No content to parse", {
          description: `${
            source === "text" ? "Text input" : "File content"
          } is empty`,
        });
        return;
      }

      try {
        setParserState((prev) => ({
          ...prev,
          status: "parsing",
          progress: 0,
          currentSection:
            source === "text" ? "Reading text input..." : "Reading file...",
          errors: [],
          warnings: [],
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

        const errorMessage =
          error instanceof Error ? error.message : "Unknown parsing error";

        setParserState((prev) => ({
          ...prev,
          status: "error",
          errors: [
            ...prev.errors,
            {
              id: Date.now().toString(),
              type: "syntax",
              message: errorMessage,
              severity: "error",
            },
          ],
        }));

        toast.error("Failed to parse XML", {
          description: errorMessage,
        });
      }
    },
    []
  );

  /**
   * Clear parsing results and reset state
   */
  const clearResults = useCallback(() => {
    setElements([]);
    setParserState({
      status: "idle",
      progress: 0,
      currentSection: "",
      elementsProcessed: 0,
      memoryUsage: 0,
      errors: [],
      warnings: [],
    });
  }, []);

  /**
   * Search elements using parser's search functionality
   */
  const searchElements = useCallback(
    (query: string) => {
      if (query.trim()) {
        parser.searchElements(query);
      }
    },
    [parser]
  );

  return {
    parser,
    elements,
    parserState,
    parseXMLContent,
    clearResults,
    searchElements,
  };
}
