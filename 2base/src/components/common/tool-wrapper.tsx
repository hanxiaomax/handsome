import React from "react";
import { ToolLayout } from "@/components/layout/tool-layout";
import { useToolControls } from "@/hooks/use-tool-controls";
import type { ToolInfo } from "@/types/tool";
import { cn } from "@/lib/utils";

interface ToolWrapperProps {
  toolInfo: ToolInfo;
  state?: Record<string, unknown>;
  children: React.ReactNode;
  maxWidth?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "full";
  className?: string;
  customControls?: React.ReactNode;
}

/**
 * Universal tool wrapper component
 * Automatically provides all tool control functionality including:
 * - Favorite toggle
 * - Minimize with state preservation
 * - Navigation controls
 * - Width constraints
 * - Custom controls in the tool layout header
 *
 * Usage:
 * <ToolWrapper toolInfo={toolInfo} state={optionalState} maxWidth="4xl" customControls={customControls}>
 *   <YourToolContent />
 * </ToolWrapper>
 */
export function ToolWrapper({
  toolInfo,
  state,
  children,
  maxWidth = "full",
  className,
  customControls,
}: ToolWrapperProps) {
  const { toolLayoutProps } = useToolControls({ toolInfo, state });

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case "sm":
        return "max-w-sm";
      case "md":
        return "max-w-md";
      case "lg":
        return "max-w-lg";
      case "xl":
        return "max-w-xl";
      case "2xl":
        return "max-w-2xl";
      case "3xl":
        return "max-w-3xl";
      case "4xl":
        return "max-w-4xl";
      case "5xl":
        return "max-w-5xl";
      case "6xl":
        return "max-w-6xl";
      case "full":
      default:
        return "max-w-full";
    }
  };

  return (
    <ToolLayout {...toolLayoutProps} customControls={customControls}>
      <div className={cn("w-full mx-auto", getMaxWidthClass(), className)}>
        {children}
      </div>
    </ToolLayout>
  );
}
