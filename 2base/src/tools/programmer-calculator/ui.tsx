"use client";

import { useState, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/layout/tool-layout";
import { useToolControls } from "@/hooks/use-tool-controls";
import { AdvancedBitwiseVisualization } from "./components/AdvancedBitwiseVisualization";

import { toolInfo } from "./toolInfo";
import {
  useIsToolMinimized,
  useToolState,
  useMinimizedToolsActions,
} from "@/stores/minimized-tools-store";
import type { Base, BitWidth } from "./types";

export default function ProgrammerCalculator() {
  // Current expression and result for synchronization
  const [currentExpression, setCurrentExpression] = useState("");
  const [currentResult, setCurrentResult] = useState<number | null>(null);

  // Calculator state for synchronization
  const [calculatorBase, setCalculatorBase] = useState<Base>(10);
  const [calculatorBitWidth, setCalculatorBitWidth] = useState<BitWidth>(32);

  // Store hooks for tool restoration
  const isMinimized = useIsToolMinimized(toolInfo.id);
  const savedState = useToolState(toolInfo.id);
  const { restoreTool } = useMinimizedToolsActions();

  // Tool controls for minimize and favorite functionality
  const { toolLayoutProps } = useToolControls({
    toolInfo,
    state: {
      currentExpression,
      currentResult,
      calculatorBase,
      calculatorBitWidth,
    },
  });

  // Handle tool restoration from minimized state
  useEffect(() => {
    if (isMinimized && savedState) {
      // Restore tool state
      if (savedState.currentExpression) {
        setCurrentExpression(savedState.currentExpression as string);
      }
      if (savedState.currentResult !== undefined) {
        setCurrentResult(savedState.currentResult as number | null);
      }
      if (savedState.calculatorBase) {
        setCalculatorBase(savedState.calculatorBase as Base);
      }
      if (savedState.calculatorBitWidth) {
        setCalculatorBitWidth(savedState.calculatorBitWidth as BitWidth);
      }

      // Remove from minimized tools
      restoreTool(toolInfo.id);
    }
  }, [isMinimized, savedState, restoreTool]);

  // Handle expression changes from visualization component
  const handleExpressionChange = useCallback(
    (expression: string, result: number | null) => {
      setCurrentExpression(expression);
      setCurrentResult(result);
    },
    []
  );

  return (
    <ToolLayout {...toolLayoutProps}>
      <div className="w-full p-6 space-y-6">
        {/* Main Content Layout */}
        <div className="flex justify-center">
          {/* Bitwise Visualization Panel (full width) */}
          <div className="max-w-6xl w-full">
            <AdvancedBitwiseVisualization
              initialExpression={currentExpression}
              onExpressionChange={handleExpressionChange}
            />
          </div>
        </div>

        {/* Status display */}
        {currentResult !== null && (
          <div className="text-center text-sm text-muted-foreground">
            Current result:{" "}
            <span className="font-mono font-semibold">{currentResult}</span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
