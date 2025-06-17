import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Base, BitWidth } from "../types";
import { formatForBase } from "../lib/base-converter";
import { 
  processExpression, 
  getExpressionExamples,
  type ParsedExpression,
  type ExpressionResult 
} from "../lib/expression-parser";

interface BitwiseVisualizationProps {
  initialExpression?: string;
  onExpressionChange?: (expression: string, result: number | null) => void;
}

export function AdvancedBitwiseVisualization({ 
  initialExpression = "", 
  onExpressionChange 
}: BitwiseVisualizationProps) {
  // Component state - completely independent
  const [expression, setExpression] = useState(initialExpression);
  const [base, setBase] = useState<Base>(10);
  const [bitWidth, setBitWidth] = useState<BitWidth>(32);
  const [evaluationResult, setEvaluationResult] = useState<{
    parsed: ParsedExpression;
    result: ExpressionResult;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Format values for different bases
  const formatValue = useCallback((value: number, targetBase: Base): string => {
    try {
      // Handle negative numbers and overflow
      const maskedValue = targetBase === 2 ? 
        (value >>> 0) : // Unsigned 32-bit for binary display
        value;
      return formatForBase(maskedValue.toString(), targetBase).toUpperCase();
    } catch {
      return "0";
    }
  }, []);

  // Process expression
  const processExpressionInput = useCallback(async (expr: string) => {
    if (!expr.trim()) {
      setEvaluationResult(null);
      onExpressionChange?.(expr, null);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Add small delay to show processing state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = processExpression(expr, base, bitWidth);
      setEvaluationResult(result);
      
      // Notify parent of result
      const finalResult = result.result.isValid ? result.result.finalResult : null;
      onExpressionChange?.(expr, finalResult);
      
    } catch (error) {
      console.error("Expression processing error:", error);
      setEvaluationResult({
        parsed: {
          tokens: [],
          isValid: false,
          error: "Processing error",
          operationType: "none",
        },
        result: {
          steps: [],
          finalResult: 0,
          isValid: false,
          error: "Processing error",
        },
      });
      onExpressionChange?.(expr, null);
    } finally {
      setIsProcessing(false);
    }
  }, [base, bitWidth, onExpressionChange]);

  // Handle expression input change
  const handleExpressionChange = (value: string) => {
    setExpression(value);
  };

  // Handle expression submission
  const handleExpressionSubmit = () => {
    processExpressionInput(expression);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExpressionSubmit();
    }
  };

  // Clear result when expression changes but don't auto-calculate
  useEffect(() => {
    if (!expression.trim()) {
      setEvaluationResult(null);
    }
    // Remove auto-processing - user must click Calculate or press Enter
  }, [expression]);

  // Handle initial expression
  useEffect(() => {
    if (initialExpression && initialExpression !== expression) {
      setExpression(initialExpression);
    }
  }, [initialExpression]);

  // Render single bit row with proper styling
  const renderBitRow = (
    value: number,
    operator?: string,
    isResult: boolean = false,
    stepIndex?: number
  ) => {
    const binary = formatValue(value, 2).padStart(bitWidth, "0");
    const hex = formatValue(value, 16);
    const decimal = value;
    const rowKey = `row-${stepIndex}-${operator || 'value'}-${value}`;

    // Color coding for different types
    const getValueColor = () => {
      if (isResult) return "text-green-600 font-bold";
      if (operator) return "text-blue-600 font-semibold";
      return "text-foreground";
    };

    const getBitColor = (bit: string) => {
      if (bit === "1") {
        if (isResult) return "text-green-600 font-bold bg-green-50 dark:bg-green-950";
        if (operator) return "text-blue-600 font-semibold bg-blue-50 dark:bg-blue-950";
        return "text-accent-foreground font-semibold bg-accent/10";
      }
      return "text-muted-foreground";
    };

    return (
      <div
        key={rowKey}
        className={`flex items-center py-2 px-3 rounded transition-colors ${
          hoveredRow === rowKey ? "bg-muted/30" : ""
        } ${isResult ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" : ""}`}
        onMouseEnter={() => setHoveredRow(rowKey)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        {/* Left: Operator and decimal value */}
        <div className="flex items-center w-[160px] border-r border-border pr-4">
          {/* Operator symbol */}
          <div className="w-8 text-center font-mono text-sm font-bold text-primary">
            {operator || (isResult ? "=" : "")}
          </div>
          
          {/* Decimal value */}
          <div className={`flex-1 text-right font-mono text-sm ${getValueColor()}`}>
            {decimal}
          </div>
        </div>

        {/* Middle: Bit visualization */}
        <div className="flex-1 px-4 border-r border-border">
          <div className="flex gap-1 justify-center">
            {binary.split("").map((bit, index) => {
              const position = bitWidth - 1 - index;
              return (
                <span
                  key={`${rowKey}-bit-${position}`}
                  className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded transition-colors ${getBitColor(bit)} ${
                    index % 4 === 0 && index > 0 ? "ml-1" : ""
                  } ${index % 8 === 0 && index > 0 ? "ml-2" : ""}`}
                >
                  {bit}
                </span>
              );
            })}
          </div>
        </div>

        {/* Right: Hex and info */}
        <div className="flex items-center w-[200px] pl-4">
          <div className="w-24 text-left font-mono text-sm text-muted-foreground">
            0x{hex}
          </div>
          <div className="flex-1 flex justify-end">
            <Badge variant={isResult ? "default" : "outline"} className="text-xs">
              {bitWidth}bit
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  // Render compact expression visualization (like the image)
  const renderCompactExpression = () => {
    if (!evaluationResult?.result.isValid) return null;

    // For single value expressions
    if (!evaluationResult.result.steps.length) {
      const value = evaluationResult.result.finalResult;
      return (
        <div className="space-y-1">
          {renderBitRow(value, undefined, true)}
        </div>
      );
    }

    // For multi-operand expressions - show all operands and operators in sequence
    const steps = evaluationResult.result.steps;
    const allOperands: Array<{ value: number; operator?: string }> = [];
    
    // Collect all operands and operators from steps
    if (steps.length > 0) {
      // First operand
      allOperands.push({ value: steps[0].operand1 });
      
      // Add subsequent operands with their operators
      steps.forEach(step => {
        if (step.operand2 !== undefined) {
          allOperands.push({ 
            value: step.operand2, 
            operator: step.operator 
          });
        }
      });
    }

    return (
      <div className="space-y-1">
        {/* Show all operands with operators */}
        {allOperands.map((item, index) => 
          renderBitRow(item.value, item.operator, false, index)
        )}
        
        {/* Separator line */}
        <div className="flex items-center px-3">
          <div className="w-[160px] pr-4"></div>
          <div className="flex-1 px-4">
            <div className="border-t border-border border-dashed"></div>
          </div>
          <div className="w-[200px] pl-4"></div>
        </div>
        
        {/* Final result */}
        {renderBitRow(evaluationResult.result.finalResult, "=", true)}
      </div>
    );
  };



  // Render error state
  const renderError = () => {
    const error = evaluationResult?.parsed.error || evaluationResult?.result.error;
    if (!error) return null;

    return (
      <Alert variant="destructive">
        <AlertDescription>
          <div className="space-y-2">
            <p><strong>Error:</strong> {error}</p>
            <p className="text-sm">
              Try examples like: <code>15 & 7</code>, <code>23 | 45</code>, <code>~42</code>, <code>8 &lt;&lt; 2</code>
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // Render help examples
  const renderHelp = () => {
    return (
      <Alert>
        <AlertDescription>
          <div className="space-y-2">
            <p><strong>Expression Examples:</strong></p>
            {getExpressionExamples().map((example, index) => (
              <div
                key={index}
                className="font-mono text-sm bg-muted/50 p-2 rounded cursor-pointer hover:bg-muted/70"
                onClick={() => setExpression(example)}
              >
                {example}
              </div>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bitwise Operation Visualization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Expression input */}
          <div className="space-y-2">
            <Label htmlFor="expression">Expression</Label>
            <div className="flex gap-2">
              <Input
                id="expression"
                placeholder="Enter expression like '15 & 7 | 3' and press Enter or click Calculate"
                value={expression}
                onChange={(e) => handleExpressionChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="font-mono"
                disabled={isProcessing}
              />
              <Button 
                onClick={handleExpressionSubmit}
                disabled={!expression.trim() || isProcessing}
              >
                {isProcessing ? "Processing..." : "Calculate"}
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label htmlFor="base">Base</Label>
              <Select value={base.toString()} onValueChange={(value) => setBase(parseInt(value) as Base)}>
                <SelectTrigger id="base" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Bin</SelectItem>
                  <SelectItem value="8">Oct</SelectItem>
                  <SelectItem value="10">Dec</SelectItem>
                  <SelectItem value="16">Hex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bitwidth">Bit Width</Label>
              <Select value={bitWidth.toString()} onValueChange={(value) => setBitWidth(parseInt(value) as BitWidth)}>
                <SelectTrigger id="bitwidth" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="32">32</SelectItem>
                  <SelectItem value="64">64</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Visualization */}
        <div className="space-y-4">
          {/* Error display */}
          {evaluationResult && !evaluationResult.parsed.isValid && renderError()}
          
          {/* Help display */}
          {expression.toLowerCase().trim() === "help" && renderHelp()}
          
          {/* Results display */}
          {evaluationResult?.result.isValid && (
            <div className="space-y-4">
              {/* Expression header */}
              <div className="text-lg font-semibold">
                Expression: <code className="text-primary">{expression}</code>
              </div>
              
              {/* Compact expression visualization */}
              {renderCompactExpression()}
            </div>
          )}
          
          {/* Empty state */}
          {!expression.trim() && (
            <div className="text-center text-muted-foreground py-8">
              <p>Enter an expression above and press Enter or click Calculate</p>
              <p className="text-sm mt-2">
                Try: <code className="cursor-pointer hover:text-primary" onClick={() => setExpression("15 & 7")}>15 & 7</code> or type <code>help</code> for examples
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
