import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/contexts/favorites-context";
import { useMinimizedTools } from "@/contexts/minimized-tools-context";
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
  const { favorites, toggleFavorite } = useFavorites();
  const { minimizeTool } = useMinimizedTools();

  // Favorite functionality
  const isFavorite = favorites.includes(toolInfo.id);

  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(toolInfo.id);
  }, [toggleFavorite, toolInfo.id]);

  // Navigation functionality
  const handleNavigateHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Minimize functionality with optional state preservation
  const handleMinimize = useCallback(() => {
    if (state) {
      minimizeTool(toolInfo, state);
    }
    navigate("/");
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
