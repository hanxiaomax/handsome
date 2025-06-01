import React, { createContext, useContext, useState, useEffect } from "react";
import type { ToolInfo } from "@/shared/types/tool";

const MINIMIZED_TOOLS_STORAGE_KEY = "tool-suite-minimized-tools";

interface MinimizedTool {
  id: string;
  toolInfo: ToolInfo;
  minimizedAt: number;
  // Store any tool-specific state here if needed
  state?: Record<string, unknown>;
}

interface MinimizedToolsContextType {
  minimizedTools: MinimizedTool[];
  minimizeTool: (toolInfo: ToolInfo, state?: Record<string, unknown>) => void;
  restoreTool: (toolId: string) => void;
  closeTool: (toolId: string) => void;
  isToolMinimized: (toolId: string) => boolean;
  clearAllMinimized: () => void;
}

const MinimizedToolsContext = createContext<
  MinimizedToolsContextType | undefined
>(undefined);

export function MinimizedToolsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [minimizedTools, setMinimizedTools] = useState<MinimizedTool[]>([]);

  // Load minimized tools from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MINIMIZED_TOOLS_STORAGE_KEY);
      if (stored) {
        const parsedTools = JSON.parse(stored);
        setMinimizedTools(parsedTools);
      }
    } catch (error) {
      console.error("Failed to load minimized tools:", error);
    }
  }, []);

  // Save minimized tools to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        MINIMIZED_TOOLS_STORAGE_KEY,
        JSON.stringify(minimizedTools)
      );
    } catch (error) {
      console.error("Failed to save minimized tools:", error);
    }
  }, [minimizedTools]);

  const minimizeTool = (
    toolInfo: ToolInfo,
    state?: Record<string, unknown>
  ) => {
    setMinimizedTools((prev) => {
      // Check if tool is already minimized
      const existingIndex = prev.findIndex((tool) => tool.id === toolInfo.id);

      const newTool: MinimizedTool = {
        id: toolInfo.id,
        toolInfo,
        minimizedAt: Date.now(),
        state,
      };

      if (existingIndex >= 0) {
        // Update existing minimized tool
        const updated = [...prev];
        updated[existingIndex] = newTool;
        return updated;
      } else {
        // Add new minimized tool
        return [...prev, newTool];
      }
    });
  };

  const restoreTool = (toolId: string) => {
    // Don't remove from minimized list, just let the tool handle restoration
    // The tool component will decide whether to stay minimized or not
    void toolId; // Explicitly mark as intentionally unused
  };

  const closeTool = (toolId: string) => {
    setMinimizedTools((prev) => prev.filter((tool) => tool.id !== toolId));
  };

  const isToolMinimized = (toolId: string) => {
    return minimizedTools.some((tool) => tool.id === toolId);
  };

  const clearAllMinimized = () => {
    setMinimizedTools([]);
  };

  return (
    <MinimizedToolsContext.Provider
      value={{
        minimizedTools,
        minimizeTool,
        restoreTool,
        closeTool,
        isToolMinimized,
        clearAllMinimized,
      }}
    >
      {children}
    </MinimizedToolsContext.Provider>
  );
}

export function useMinimizedTools() {
  const context = useContext(MinimizedToolsContext);
  if (context === undefined) {
    throw new Error(
      "useMinimizedTools must be used within a MinimizedToolsProvider"
    );
  }
  return context;
}
