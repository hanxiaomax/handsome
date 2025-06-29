/**
 * XML Parser Hook
 *
 * Custom React hook that manages XML parsing state and operations
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { XMLStreamParser } from "./index";
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
        // Clear previous state
        setParserState((prev) => ({
          ...prev,
          status: "parsing",
          progress: 0,
          currentSection:
            source === "text" ? "Reading text input..." : "Reading file...",
          errors: [],
          warnings: [],
        }));

        // Use the new parseText method with validation
        await parser.parseText(
          content,
          {
            packages: [],
            elementTypes: ["ELEMENT"],
            maxDepth: 100,
            maxElements: 10000,
            validateSchema: true,
            enableReferences: true,
            memoryLimit: 500 * 1024 * 1024, // 500MB
          },
          // Progress callback
          (state: ParserState) => {
            setParserState(state);
          },
          // Complete callback
          (parsedElements: XMLElement[]) => {
            setElements(parsedElements);

            // Show validation results
            const currentState = parser.getState();
            if (currentState.errors.length > 0) {
              toast.error("XML validation errors found", {
                description: `Found ${currentState.errors.length} validation errors. Check the status bar for details.`,
              });
            } else if (currentState.warnings.length > 0) {
              toast.warning("XML validation warnings", {
                description: `Found ${currentState.warnings.length} validation warnings. Check the status bar for details.`,
              });
            } else {
              toast.success("XML parsed successfully!", {
                description: `Found ${parsedElements.length} elements in the XML structure`,
              });
            }
          },
          // Error callback
          (error) => {
            console.error("Failed to parse XML:", error);

            setParserState((prev) => ({
              ...prev,
              status: "error",
              errors: [...prev.errors, error],
            }));

            toast.error("Failed to parse XML", {
              description: error.message,
            });
          }
        );
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
    [parser]
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
