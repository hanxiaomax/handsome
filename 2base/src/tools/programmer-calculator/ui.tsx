"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/layout/tool-layout";
import { AdvancedBitwiseVisualization } from "./components/AdvancedBitwiseVisualization";
import { ProgrammerCal } from "./components/programmer-cal";
import { toolInfo } from "./toolInfo";
import type { Base, BitWidth } from "./types";

export default function ProgrammerCalculator() {
  // Current expression and result for synchronization
  const [currentExpression, setCurrentExpression] = useState("");
  const [currentResult, setCurrentResult] = useState<number | null>(null);

  // Calculator state for synchronization
  const [calculatorBase, setCalculatorBase] = useState<Base>(10);
  const [calculatorBitWidth, setCalculatorBitWidth] = useState<BitWidth>(32);

  // Right panel state
  const [isCalculatorPanelOpen, setIsCalculatorPanelOpen] = useState(false);

  // Handle expression changes from visualization component
  const handleExpressionChange = useCallback(
    (expression: string, result: number | null) => {
      setCurrentExpression(expression);
      setCurrentResult(result);
    },
    []
  );

  // Toggle calculator panel
  const handleToggleCalculator = useCallback(() => {
    setIsCalculatorPanelOpen(!isCalculatorPanelOpen);
  }, [isCalculatorPanelOpen]);

  // Right panel content - Calculator (only when open)
  const rightPanelContent = isCalculatorPanelOpen ? (
    <div className="h-full">
      <ProgrammerCal
        compact={true}
        borderless={true}
        maxWidth="full"
        initialBase={calculatorBase}
        initialBitWidth={calculatorBitWidth}
        onValueChange={(_value: string, newBase: Base) => {
          // Update expression with the new value and base
          setCalculatorBase(newBase);
        }}
        onOperationComplete={(_expressionStr: string, result: string) => {
          // Update the main expression when calculation is complete
          setCurrentExpression(result);
        }}
        onBaseChange={(newBase: Base) => {
          // Sync base changes
          setCalculatorBase(newBase);
        }}
        onBitWidthChange={(newBitWidth: BitWidth) => {
          // Sync bit width changes
          setCalculatorBitWidth(newBitWidth);
        }}
        onStateChange={(state) => {
          // Real-time sync: update expression whenever currentValue changes
          if (state.currentValue && state.currentValue !== "0") {
            setCurrentExpression(state.currentValue);
          }
          // Sync base and bit width changes
          setCalculatorBase(state.base);
          setCalculatorBitWidth(state.bitWidth);
        }}
      />
    </div>
  ) : undefined;

  return (
    <ToolLayout toolName={toolInfo.name} toolDescription={toolInfo.description}>
      <div className="w-full p-6 space-y-6">
        {/* Main Content Layout */}
        <div className="flex justify-center">
          {/* Bitwise Visualization Panel (full width) */}
          <div className="max-w-6xl w-full">
            <AdvancedBitwiseVisualization
              initialExpression={currentExpression}
              onExpressionChange={handleExpressionChange}
              onToggleCalculator={handleToggleCalculator}
              isCalculatorOpen={isCalculatorPanelOpen}
              calculatorContent={rightPanelContent}
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
