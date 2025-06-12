import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useIsFavorite, useFavoriteActions } from "@/stores/favorites-store";
import { useMinimizedToolsActions } from "@/stores/minimized-tools-store";
import type { ToolInfo } from "@/types/tool";

interface UseToolControlsOptions {
  toolInfo: ToolInfo;
  state?: Record<string, unknown>;
}

interface ToolControlsResult {
  // Favorite functionality
  isFavorite: boolean;
  handleToggleFavorite: () => void;

  // Navigation functionality
  handleNavigateHome: () => void;

  // Minimize functionality
  handleMinimize: () => void;

  // Complete props for ToolLayout
  toolLayoutProps: {
    toolName: string;
    toolDescription?: string;
    onMinimize: () => void;
    onToggleFavorite: () => void;
    isFavorite: boolean;
  };
}

/**
 * Universal hook for tool control functionality
 * Provides consistent behavior across all tools for:
 * - Favorite toggle
 * - Navigation home
 * - Minimize with state preservation
 * - Ready-to-use ToolLayout props
 */
export function useToolControls({
  toolInfo,
  state,
}: UseToolControlsOptions): ToolControlsResult {
  const navigate = useNavigate();
  const isFavorite = useIsFavorite(toolInfo.id);
  const { toggleFavorite } = useFavoriteActions();
  const { minimizeTool } = useMinimizedToolsActions();

  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(toolInfo.id);
  }, [toggleFavorite, toolInfo.id]);

  // Navigation functionality
  const handleNavigateHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Minimize functionality with optional state preservation
  const handleMinimize = useCallback(() => {
    // Always minimize the tool, with or without state
    minimizeTool(toolInfo, state);
    // Navigate to tools page, not landing page
    navigate("/tools");
  }, [minimizeTool, toolInfo, state, navigate]);

  // Complete props for ToolLayout
  const toolLayoutProps = {
    toolName: toolInfo.name,
    toolDescription: toolInfo.description,
    onMinimize: handleMinimize,
    onToggleFavorite: handleToggleFavorite,
    isFavorite: isFavorite,
  };

  return {
    isFavorite,
    handleToggleFavorite,
    handleNavigateHome,
    handleMinimize,
    toolLayoutProps,
  };
}
