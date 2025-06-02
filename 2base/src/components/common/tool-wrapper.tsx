import React from "react";
import { ToolLayout } from "@/components/layout/tool-layout";
import { useToolControls } from "@/hooks/use-tool-controls";
import type { ToolInfo } from "@/types/tool";

interface ToolWrapperProps {
  toolInfo: ToolInfo;
  state?: Record<string, unknown>;
  children: React.ReactNode;
}

/**
 * Universal tool wrapper component
 * Automatically provides all tool control functionality including:
 * - Favorite toggle
 * - Minimize with state preservation
 * - Navigation controls
 *
 * Usage:
 * <ToolWrapper toolInfo={toolInfo} state={optionalState}>
 *   <YourToolContent />
 * </ToolWrapper>
 */
export function ToolWrapper({ toolInfo, state, children }: ToolWrapperProps) {
  const { toolLayoutProps } = useToolControls({ toolInfo, state });

  return <ToolLayout {...toolLayoutProps}>{children}</ToolLayout>;
}
