"use client";

import { useState, useCallback } from "react";
import { Calculator } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { ProgrammerCal } from "./components/programmer-cal";
import { AdvancedBitwiseVisualization } from "./components/AdvancedBitwiseVisualization";
import { toolInfo } from "./toolInfo";

export default function ProgrammerCalculator() {
  // Show calculator panel state (default hidden)
  const [showCalculator, setShowCalculator] = useState(false);
  // Current expression and result for synchronization
  const [currentExpression, setCurrentExpression] = useState("");
  const [currentResult, setCurrentResult] = useState<number | null>(null);

  // Calculator panel toggle
  const handleCalculatorToggle = (checked: boolean) => {
    setShowCalculator(checked);
  };

  // Handle expression changes from visualization component
  const handleExpressionChange = useCallback(
    (expression: string, result: number | null) => {
      setCurrentExpression(expression);
      setCurrentResult(result);
    },
    []
  );

  // Control panel components
  const controlPanel = (
    <div className="flex items-center space-x-4">
      {/* Calculator panel toggle */}
      <div className="flex items-center space-x-2">
        <Calculator className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="calculator-toggle" className="text-sm font-medium">
          Calculator Panel
        </Label>
        <Switch
          id="calculator-toggle"
          checked={showCalculator}
          onCheckedChange={handleCalculatorToggle}
        />
      </div>
    </div>
  );

  return (
    <ToolWrapper
      toolInfo={toolInfo}
      maxWidth="full"
      customControls={controlPanel}
    >
      <div className="space-y-6">
        {/* Main Content Layout */}
        <div
          className={`flex gap-6 ${
            showCalculator ? "justify-start" : "justify-center"
          }`}
        >
          {/* Calculator Panel (conditional) */}
          {showCalculator && (
            <div className="flex-shrink-0 w-[400px]">
              <ProgrammerCal
                forceStoreState={true}
                hideBitVisualization={true}
                maxWidth="md"
              />
            </div>
          )}

          {/* Bitwise Visualization Panel (always visible, now independent) */}
          <div
            className={`${
              showCalculator ? "flex-1" : "max-w-6xl w-full"
            } min-w-0`}
          >
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
    </ToolWrapper>
  );
}
