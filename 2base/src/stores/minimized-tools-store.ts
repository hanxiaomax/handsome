import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";
import type { ToolInfo } from "@/types/tool";

interface MinimizedTool {
  id: string;
  toolInfo: ToolInfo;
  minimizedAt: number;
  state?: Record<string, unknown>;
}

interface MinimizedToolsStore {
  minimizedTools: MinimizedTool[];
  minimizeTool: (toolInfo: ToolInfo, state?: Record<string, unknown>) => void;
  restoreTool: (toolId: string) => void;
  closeTool: (toolId: string) => void;
  isToolMinimized: (toolId: string) => boolean;
  clearAllMinimized: () => void;
  getToolState: (toolId: string) => Record<string, unknown> | undefined;
}

export const useMinimizedToolsStore = create<MinimizedToolsStore>()(
  persist(
    (set, get) => ({
      minimizedTools: [],

      minimizeTool: (toolInfo: ToolInfo, state?: Record<string, unknown>) => {
        set((currentState) => {
          const existingIndex = currentState.minimizedTools.findIndex(
            (tool) => tool.id === toolInfo.id
          );

          const newTool: MinimizedTool = {
            id: toolInfo.id,
            toolInfo,
            minimizedAt: Date.now(),
            state,
          };

          if (existingIndex >= 0) {
            // Update existing minimized tool
            const updated = [...currentState.minimizedTools];
            updated[existingIndex] = newTool;
            return { minimizedTools: updated };
          } else {
            // Add new minimized tool
            const newList = [...currentState.minimizedTools, newTool];
            return {
              minimizedTools: newList,
            };
          }
        });
      },

      restoreTool: (toolId: string) => {
        set((state) => ({
          minimizedTools: state.minimizedTools.filter(
            (tool) => tool.id !== toolId
          ),
        }));
      },

      closeTool: (toolId: string) => {
        set((state) => ({
          minimizedTools: state.minimizedTools.filter(
            (tool) => tool.id !== toolId
          ),
        }));
      },

      isToolMinimized: (toolId: string) => {
        return get().minimizedTools.some((tool) => tool.id === toolId);
      },

      clearAllMinimized: () => {
        set({ minimizedTools: [] });
      },

      getToolState: (toolId: string) => {
        const tool = get().minimizedTools.find((tool) => tool.id === toolId);
        return tool?.state;
      },
    }),
    {
      name: "tool-suite-minimized-tools",
    }
  )
);

// 精确订阅的选择器hooks
export const useMinimizedToolsList = () =>
  useMinimizedToolsStore((state) => state.minimizedTools);

export const useIsToolMinimized = (toolId: string) =>
  useMinimizedToolsStore((state) =>
    state.minimizedTools.some((tool) => tool.id === toolId)
  );

// 使用 useMemo 缓存 actions 对象，防止无限循环
export const useMinimizedToolsActions = () => {
  const minimizeTool = useMinimizedToolsStore((state) => state.minimizeTool);
  const restoreTool = useMinimizedToolsStore((state) => state.restoreTool);
  const closeTool = useMinimizedToolsStore((state) => state.closeTool);
  const clearAllMinimized = useMinimizedToolsStore(
    (state) => state.clearAllMinimized
  );

  return useMemo(
    () => ({
      minimizeTool,
      restoreTool,
      closeTool,
      clearAllMinimized,
    }),
    [minimizeTool, restoreTool, closeTool, clearAllMinimized]
  );
};

export const useMinimizedToolsCount = () =>
  useMinimizedToolsStore((state) => state.minimizedTools.length);

export const useToolState = (toolId: string) =>
  useMinimizedToolsStore((state) => state.getToolState(toolId));
