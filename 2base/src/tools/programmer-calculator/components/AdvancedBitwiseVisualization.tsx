import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { Base } from "../types";
import { parseValue, formatForBase } from "../lib/base-converter";
import { toggleBit } from "../lib/bitwise";
import { useCalculatorSnapshot, useCalculatorActions } from "../lib/store";
import {
  getExpressionExamples,
  type ParsedExpression,
  type ExpressionResult,
} from "../lib/expression-parser";

export function AdvancedBitwiseVisualization() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [expression, setExpression] = useState("");
  const [evaluationResult, setEvaluationResult] = useState<{
    parsed: ParsedExpression;
    result: ExpressionResult;
  } | null>(null);

  // Get state from store
  const { currentValue, base, bitWidth } = useCalculatorSnapshot();
  const actions = useCalculatorActions();

  // Parse values safely
  const parseValueSafe = useCallback(
    (value: string, fallback: number = 0): number => {
      try {
        return parseValue(value || "0", base, bitWidth);
      } catch {
        return fallback;
      }
    },
    [base, bitWidth]
  );

  // Format values for different bases
  const formatValue = useCallback((value: number, targetBase: Base): string => {
    try {
      return formatForBase(value.toString(), targetBase).toUpperCase();
    } catch {
      return "0";
    }
  }, []);

  // Handle bit click - update store directly
  const handleBitClick = useCallback(
    (value: number) => {
      return (position: number) => {
        const newValue = toggleBit(value, position, bitWidth);
        const formattedValue = formatForBase(newValue.toString(), base);
        actions.setValue(formattedValue, "visualization");
      };
    },
    [bitWidth, base, actions]
  );

  // Process expression when currentValue changes
  useEffect(() => {
    if (currentValue && currentValue !== "0") {
      // Try to process as simple value first
      const numericValue = parseValueSafe(currentValue);
      if (numericValue !== 0) {
        setExpression(currentValue);
        setEvaluationResult({
          parsed: {
            tokens: [{ type: "operand", value: currentValue, numericValue }],
            isValid: true,
            operationType: "none",
          },
          result: {
            steps: [],
            finalResult: numericValue,
            isValid: true,
          },
        });
      }
    }
  }, [currentValue, parseValueSafe]);



  // Render single bit row
  const renderBitRow = (
    label: string,
    value: number,
    color: string = "default",
    clickable: boolean = false,
    prefix?: string,
    isResult: boolean = false
  ) => {
    const binary = formatValue(value, 2).padStart(bitWidth, "0");
    const hex = formatValue(value, 16);
    const isSigned = value < 0 || value >= Math.pow(2, bitWidth - 1);

    return (
      <div
        className={`flex items-center py-2 px-3 rounded transition-colors ${
          hoveredRow === label ? "bg-muted/50" : ""
        } ${isResult ? "bg-accent/20" : ""}`}
        onMouseEnter={() => setHoveredRow(label)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        {/* Left area: operator and value */}
        <div className="flex items-center w-[140px] border-r border-border pr-3">
          {/* Operator prefix - fixed 16px width slot */}
          <div className="w-16 text-center font-mono text-sm font-bold text-primary">
            {prefix || ""}
          </div>

          {/* Decimal value - fixed width for alignment */}
          <div className="w-24 text-right font-mono text-sm">{value}</div>
        </div>

        {/* Middle area: bit sequence */}
        <div className="flex-1 px-4 border-r border-border">
          <div className="flex gap-1">
            {binary.split("").map((bit, index) => {
              const position = bitWidth - 1 - index;

              return (
                <span
                  key={position}
                  className={`w-4 h-4 flex items-center justify-center text-xs font-mono ${
                    bit === "1"
                      ? color === "primary"
                        ? "text-primary font-bold"
                        : color === "secondary"
                        ? "text-secondary font-bold"
                        : color === "result"
                        ? "text-green-600 font-bold"
                        : "text-accent-foreground font-bold"
                      : "text-muted-foreground"
                  } ${
                    clickable
                      ? "cursor-pointer hover:bg-accent/20 rounded"
                      : "cursor-default"
                  } ${index % 4 === 0 && index > 0 ? "ml-1" : ""} ${
                    index % 8 === 0 && index > 0 ? "ml-2" : ""
                  }`}
                  onClick={
                    clickable
                      ? () => handleBitClick(value)(position)
                      : undefined
                  }
                >
                  {bit}
                </span>
              );
            })}
          </div>
        </div>

        {/* Right area: hex and type info */}
        <div className="flex items-center w-[240px] pl-3">
          {/* Hex value - fixed width column */}
          <div className="w-20 text-left font-mono text-sm text-muted-foreground">
            0x{hex}
          </div>

          {/* Type info - fixed width column */}
          <div className="w-28 flex justify-start">
            <Badge
              variant={isResult ? "default" : "outline"}
              className="text-xs"
            >
              {isSigned ? "S" : "U"}
              {bitWidth}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  // Render expression visualization
  const renderExpressionVisualization = () => {
    if (!evaluationResult || !evaluationResult.parsed.isValid) {
      // Show error or help
      if (evaluationResult?.parsed.error === "Help requested") {
        return (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>Expression Examples:</strong>
                  </p>
                  {getExpressionExamples().map((example, index) => (
                    <div
                      key={index}
                      className="font-mono text-sm bg-muted/50 p-2 rounded"
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        );
      }

      if (evaluationResult?.parsed.error) {
        return (
          <Alert variant="destructive">
            <AlertDescription>{evaluationResult.parsed.error}</AlertDescription>
          </Alert>
        );
      }

      // Default state - show placeholder
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Enter an expression to see bitwise visualization</p>
          <p className="text-sm mt-2">
            Examples: <code>15 & 7</code>, <code>23 | 45</code>,{" "}
            <code>~42</code>
          </p>
        </div>
      );
    }

    const { parsed, result } = evaluationResult;

    // Single operand case
    if (parsed.tokens.length === 1) {
      const operand = parsed.tokens[0];
      return (
        <div className="space-y-1">
          {renderBitRow(
            "value",
            operand.numericValue!,
            "primary",
            true,
            undefined,
            false
          )}
        </div>
      );
    }

    // Multi-step expression case
    if (result.steps.length > 0) {
      return (
        <div className="space-y-1">
          {/* Show each step */}
          {result.steps.map((step, index) => {
            const isFirstStep = index === 0;
            const isLastStep = index === result.steps.length - 1;

            return (
              <div key={index} className="space-y-1">
                {/* Show operands for first step */}
                {isFirstStep && (
                  <>
                    {renderBitRow(
                      `operand1-${index}`,
                      step.operand1,
                      "default",
                      false,
                      undefined,
                      false
                    )}
                    {step.operand2 !== undefined &&
                      renderBitRow(
                        `operand2-${index}`,
                        step.operand2,
                        "default",
                        false,
                        step.operator,
                        false
                      )}
                  </>
                )}

                {/* Show intermediate result */}
                {!isFirstStep &&
                  renderBitRow(
                    `intermediate-${index}`,
                    step.operand1,
                    "default",
                    false,
                    undefined,
                    false
                  )}

                {/* Show current operation operand */}
                {!isFirstStep &&
                  step.operand2 !== undefined &&
                  renderBitRow(
                    `operand-${index}`,
                    step.operand2,
                    "default",
                    false,
                    step.operator,
                    false
                  )}

                {/* Separator */}
                <div className="border-t border-dashed my-2"></div>

                {/* Show step result */}
                {renderBitRow(
                  `result-${index}`,
                  step.result,
                  "result",
                  isLastStep,
                  "=",
                  true
                )}

                {/* Add spacing between steps */}
                {!isLastStep && (
                  <div className="my-4">
                    <Separator />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Bitwise Operation Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Bitwise Operation Visualization
          </CardTitle>
          {expression && (
            <div className="text-sm text-muted-foreground">
              Expression:{" "}
              <code className="bg-muted/50 px-2 py-1 rounded">
                {expression}
              </code>
            </div>
          )}
        </CardHeader>
        <CardContent>{renderExpressionVisualization()}</CardContent>
      </Card>
    </div>
  );
}
