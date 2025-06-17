"use client";

import { useState, useCallback } from "react";
import { Calculator, Settings } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { ProgrammerCal } from "./components/programmer-cal";
import { AdvancedBitwiseVisualization } from "./components/AdvancedBitwiseVisualization";
import { processExpression } from "./lib/expression-parser";
import { useCalculatorActions } from "./lib/store";
import { formatForBase } from "./lib/base-converter";
import { toolInfo } from "./toolInfo";

export default function ProgrammerCalculator() {
  // Show calculator panel state (default hidden)
  const [showCalculator, setShowCalculator] = useState(false);
  // Expression input state
  const [expression, setExpression] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get calculator actions to update store
  const actions = useCalculatorActions();

  // Calculator panel toggle
  const handleCalculatorToggle = (checked: boolean) => {
    setShowCalculator(checked);
  };

  // Handle expression input
  const handleExpressionChange = (value: string) => {
    setExpression(value);
    setError(null);
  };

  // Handle expression submission
  const handleExpressionSubmit = useCallback(() => {
    if (!expression.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = processExpression(expression, 10, 32); // Default to decimal base, 32-bit

      if (!result.parsed.isValid) {
        setError(result.parsed.error || "Invalid expression");
        return;
      }

      if (!result.result.isValid) {
        setError(result.result.error || "Calculation error");
        return;
      }

      // Update store with final result
      const formattedResult = formatForBase(
        result.result.finalResult.toString(),
        10
      );
      actions.setValue(formattedResult, "external");
    } catch (error) {
      console.error("Expression error:", error);
      setError("Failed to process expression");
    } finally {
      setIsProcessing(false);
    }
  }, [expression, actions]);

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExpressionSubmit();
    }
  };

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

      {/* Settings button for future use */}
      <Button variant="ghost" size="sm">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <ToolWrapper
      toolInfo={toolInfo}
      maxWidth="full"
      customControls={controlPanel}
    >
      <div className="space-y-6">
        {/* Expression Input Area */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expression-input" className="text-base font-medium">
              Expression Input
            </Label>
            <div className="flex gap-2">
              <Input
                id="expression-input"
                placeholder="Type an expression like '23|45', '4 6 8', or 'help'"
                value={expression}
                onChange={(e) => handleExpressionChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="font-mono text-base"
                disabled={isProcessing}
              />
              <Button
                onClick={handleExpressionSubmit}
                disabled={!expression.trim() || isProcessing}
                className="px-6"
              >
                {isProcessing ? "Processing..." : "Calculate"}
              </Button>
            </div>

            {/* Error display */}
            {error && <div className="text-sm text-destructive">{error}</div>}
          </div>

          {/* Help text */}
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Supported operations:</strong> & (AND), | (OR), ^ (XOR), ~
              (NOT), &lt;&lt; (Left Shift), &gt;&gt; (Right Shift), +, -, *, /,
              %
            </p>
            <p>
              <strong>Examples:</strong> <code>15 & 7</code>,{" "}
              <code>23 | 45</code>, <code>~42</code>, <code>8 &lt;&lt; 2</code>,{" "}
              <code>100 + 50</code>
            </p>
            <p>
              <strong>Note:</strong> Cannot mix bitwise and arithmetic
              operations in the same expression.
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div
          className={`flex gap-4 ${
            showCalculator ? "justify-start" : "justify-center"
          }`}
        >
          {/* Calculator Panel (conditional) */}
          {showCalculator && (
            <div className="flex-shrink-0">
              <ProgrammerCal
                forceStoreState={true}
                hideBitVisualization={true}
                maxWidth="md"
              />
            </div>
          )}

          {/* Bitwise Visualization Panel (always visible) */}
          <div
            className={`${
              showCalculator ? "flex-1" : "max-w-4xl w-full"
            } min-w-0`}
          >
            <AdvancedBitwiseVisualization />
          </div>
        </div>
      </div>
    </ToolWrapper>
  );
}
