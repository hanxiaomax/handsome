import { useState, useCallback, useEffect, startTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Calculator } from "lucide-react";
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
  onToggleCalculator?: () => void;
  isCalculatorOpen?: boolean;
  calculatorContent?: React.ReactNode;
}

interface OperandInfo {
  value: number;
  originalText: string;
  startIndex: number;
  endIndex: number;
}

type SignType = 'signed' | 'unsigned';

interface OperandSignState {
  [key: string]: SignType; // key: "value_index" format
}

export function AdvancedBitwiseVisualization({ 
  initialExpression = "", 
  onExpressionChange,
  onToggleCalculator,
  isCalculatorOpen = false,
  calculatorContent
}: BitwiseVisualizationProps) {
  // Component state
  const [expression, setExpression] = useState(initialExpression);
  const [base, setBase] = useState<Base>(10);
  const [bitWidth, setBitWidth] = useState<BitWidth>(32);
  const [evaluationResult, setEvaluationResult] = useState<{
    parsed: ParsedExpression;
    result: ExpressionResult;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hoveredBit, setHoveredBit] = useState<string | null>(null);
  const [clickedBit, setClickedBit] = useState<string | null>(null);
  const [operandSigns, setOperandSigns] = useState<OperandSignState>({});

  // Format values for different bases with sign support
  const formatValue = useCallback((value: number, targetBase: Base, isSigned: boolean = true): string => {
    try {
      let displayValue = value;
      if (!isSigned && value < 0) {
        // Convert to unsigned representation
        displayValue = value >>> 0;
      }
      return formatForBase(displayValue.toString(), targetBase).toUpperCase();
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
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = processExpression(expr, base, bitWidth);
      setEvaluationResult(result);
      
      const finalResult = result.result.isValid ? result.result.finalResult : null;
      onExpressionChange?.(expr, finalResult);
      
    } catch (error) {
      console.error("Expression processing error:", error);
      setEvaluationResult({
        parsed: { tokens: [], isValid: false, error: "Processing error", operationType: "none" },
        result: { steps: [], finalResult: 0, isValid: false, error: "Processing error" },
      });
      onExpressionChange?.(expr, null);
    } finally {
      setIsProcessing(false);
    }
  }, [base, bitWidth, onExpressionChange]);

  // Extract operand information from expression with better negative number support
  const extractOperands = useCallback((expr: string): OperandInfo[] => {
    const operands: OperandInfo[] = [];
    // Enhanced regex to handle negative numbers properly
    const numberRegex = /(?:^|[^a-zA-Z0-9])(-?\d+)(?=[^a-zA-Z0-9]|$)/g;
    let match;
    
    while ((match = numberRegex.exec(expr)) !== null) {
      const fullMatch = match[0];
      const numberPart = match[1];
      const actualStartIndex = match.index + (fullMatch.length - numberPart.length);
      
      operands.push({
        value: parseInt(numberPart),
        originalText: numberPart,
        startIndex: actualStartIndex,
        endIndex: actualStartIndex + numberPart.length
      });
    }
    
    return operands;
  }, []);

  // Handle bit click with smooth, immediate updates
  const handleBitClick = useCallback((clickedValue: number, bitPosition: number, operandKey: string) => {
    if (!evaluationResult?.parsed.isValid) return;
    
    // Add immediate visual feedback
    const bitKey = `${clickedValue}-bit-${bitPosition}`;
    setClickedBit(bitKey);
    
    // Clear the clicked state after animation
    setTimeout(() => setClickedBit(null), 200);
    
    // Calculate new value with flipped bit
    const mask = 1 << bitPosition;
    let newValue = clickedValue ^ mask;
    
    // Apply sign interpretation based on operand sign setting
    const signType = operandSigns[operandKey] || 'signed';
    if (signType === 'unsigned' && newValue < 0) {
      newValue = newValue >>> 0; // Convert to unsigned
    }
    
    // Find and replace the operand in expression
    const operands = extractOperands(expression);
    
    // Try to find exact match first
    let targetOperand = operands.find(op => op.value === clickedValue);
    
    // If not found and we have negative numbers, try alternative matching
    if (!targetOperand && clickedValue < 0) {
      // Try to find by string representation
      const clickedStr = clickedValue.toString();
      targetOperand = operands.find(op => op.originalText === clickedStr);
    }
    
    if (!targetOperand) {
      console.log("Target operand not found for value:", clickedValue);
      console.log("Available operands:", operands);
      return;
    }
    
    // Replace the operand in expression
    const newExpression = expression.substring(0, targetOperand.startIndex) + 
                         newValue.toString() + 
                         expression.substring(targetOperand.endIndex);
    
    // Preserve sign type state by updating operandSigns for the new value
    // Parse the operandKey to extract position information
    const keyParts = operandKey.split('_');
    if (keyParts.length >= 2) {
      const stepIndex = keyParts[1];
      const operandIndex = keyParts.length > 2 ? keyParts[2] : '0';
      const newOperandKey = `${newValue}_${stepIndex}_${operandIndex}`;
      
      // Transfer the sign type from old key to new key
      setOperandSigns(prev => {
        const newSigns = { ...prev };
        if (prev[operandKey]) {
          newSigns[newOperandKey] = prev[operandKey];
          // Remove the old key to keep state clean
          delete newSigns[operandKey];
        }
        return newSigns;
      });
    }
    
    // Immediate synchronous update for smooth experience
    try {
      const result = processExpression(newExpression, base, bitWidth);
      
      // Use startTransition for smooth updates without blocking UI
      startTransition(() => {
        setExpression(newExpression);
        setEvaluationResult(result);
        
        const finalResult = result.result.isValid ? result.result.finalResult : null;
        onExpressionChange?.(newExpression, finalResult);
      });
      
    } catch (error) {
      console.error("Expression processing error:", error);
      // Fallback: revert to original expression if processing fails
      startTransition(() => {
        setExpression(expression);
      });
    }
  }, [evaluationResult, expression, base, bitWidth, onExpressionChange, extractOperands, operandSigns]);

  // Toggle operand sign type
  const toggleOperandSign = useCallback((operandKey: string) => {
    setOperandSigns(prev => ({
      ...prev,
      [operandKey]: prev[operandKey] === 'unsigned' ? 'signed' : 'unsigned'
    }));
  }, []);

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

  // Clear result when expression changes
  useEffect(() => {
    if (!expression.trim()) {
      setEvaluationResult(null);
    }
  }, [expression]);

  // Handle initial expression
  useEffect(() => {
    if (initialExpression && initialExpression !== expression) {
      setExpression(initialExpression);
      processExpressionInput(initialExpression);
    }
  }, [initialExpression, expression, processExpressionInput]);

  // Render single bit row with sign type support
  const renderBitRow = (
    value: number,
    operator?: string,
    isResult: boolean = false,
    isClickable: boolean = false,
    operandKey?: string
  ) => {
    const signType = operandKey ? (operandSigns[operandKey] || 'signed') : 'signed';
    const isSigned = signType === 'signed';
    
    // Handle display value based on sign type
    let displayValue = value;
    if (!isSigned && value < 0) {
      displayValue = value >>> 0; // Convert to unsigned for display
    }
    
    const binary = formatValue(displayValue, 2, isSigned).padStart(bitWidth, "0");
    const hex = formatValue(displayValue, 16, isSigned);
    const decimal = displayValue;

    const getValueColor = () => {
      if (isResult) return "text-primary font-bold";
      if (operator) return "text-secondary-foreground font-semibold";
      return "text-foreground";
    };

    const getBitColor = (bit: string, bitIndex: number) => {
      const bitKey = `${value}-bit-${bitIndex}`;
      const isHovered = hoveredBit === bitKey;
      const isClicked = clickedBit === bitKey;
      
      // Add click animation effect
      const clickEffect = isClicked ? 'scale-125 ring-2 ring-primary/50' : '';
      
      if (bit === "1") {
        if (isResult) return `text-primary font-bold bg-primary/10 ${isHovered ? 'bg-primary/20' : ''} ${clickEffect}`;
        if (operator) return `text-secondary-foreground font-semibold bg-secondary/20 ${isHovered ? 'bg-secondary/30' : ''} ${clickEffect}`;
        return `text-accent-foreground font-semibold bg-accent/10 ${isHovered ? 'bg-accent/20' : ''} ${clickEffect}`;
      }
      return `text-muted-foreground ${isHovered ? 'bg-muted/20' : ''} ${clickEffect}`;
    };

    return (
      <div className={`flex items-center py-2 px-3 rounded transition-colors ${
        isResult ? "bg-primary/5 border border-primary/20" : ""
      }`}>
        {/* Left: Operator and decimal value - fixed 180px */}
        <div className="flex items-center w-[180px] border-r border-border pr-4 flex-shrink-0">
          <div className="w-8 text-center font-mono text-sm font-bold text-primary flex-shrink-0">
            {operator || (isResult ? "=" : "")}
          </div>
          <div className={`w-[140px] text-right font-mono text-sm ${getValueColor()} flex-shrink-0`}>
            {decimal.toLocaleString()}
          </div>
        </div>

        {/* Middle: Bit visualization - responsive width based on bit width */}
        <div className={`px-4 border-r border-border flex-shrink-0 ${
          bitWidth <= 32 ? 'w-[360px]' : 'w-[600px]'
        }`}>
          <div className="flex justify-center overflow-x-auto">
            {/* Render bits with spacing every 4 bits */}
            {binary.split("").map((bit, index) => {
              const position = bitWidth - 1 - index;
              const bitKey = `${value}-bit-${position}`;
              const needsSpacing = index > 0 && index % 4 === 0;
              
              return (
                <span
                  key={bitKey}
                  className={`${bitWidth <= 32 ? 'w-5 h-5' : 'w-4 h-4'} flex items-center justify-center text-xs font-mono rounded transition-all duration-200 ${getBitColor(bit, position)} ${
                    needsSpacing ? "ml-1" : ""
                  } ${
                    isClickable ? "cursor-pointer hover:scale-110 hover:shadow-sm" : ""
                  }`}
                  onClick={isClickable && operandKey ? () => handleBitClick(value, position, operandKey) : undefined}
                  onMouseEnter={() => isClickable && setHoveredBit(bitKey)}
                  onMouseLeave={() => isClickable && setHoveredBit(null)}
                  title={isClickable ? `Click to flip bit ${position} (${bit} → ${bit === '1' ? '0' : '1'})` : undefined}
                >
                  {bit}
                </span>
              );
            })}
          </div>
        </div>

        {/* Right: Hex, sign type, and info - responsive width */}
        <div className={`flex items-center pl-4 flex-shrink-0 ${
          bitWidth <= 32 ? 'w-[250px]' : 'w-[280px]'
        }`}>
          <div className={`text-left font-mono text-sm text-muted-foreground flex-shrink-0 ${
            bitWidth <= 32 ? 'w-28' : 'w-32'
          }`}>
            0x{hex.toUpperCase()}
          </div>
          <div className="flex items-center gap-2 flex-1">
            {/* Sign type badge for operands */}
            {isClickable && operandKey && (
              <Badge
                variant="outline"
                className="text-xs cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleOperandSign(operandKey)}
                title={`Click to toggle between signed and unsigned interpretation`}
              >
                {signType}
              </Badge>
            )}
            <Badge variant={isResult ? "default" : "outline"} className="text-xs">
              {bitWidth}bit
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  // Render compact expression visualization
  const renderCompactExpression = () => {
    if (!evaluationResult?.result.isValid) return null;

    // For single value expressions
    if (!evaluationResult.result.steps.length) {
      const value = evaluationResult.result.finalResult;
      const operandKey = `${value}_0`;
      return (
        <div className="space-y-1">
          {renderBitRow(value, undefined, false, true, operandKey)}
        </div>
      );
    }

    // For multi-operand expressions
    const steps = evaluationResult.result.steps;
    
    return (
      <div className="space-y-1">
        {steps.map((step, stepIndex) => (
          <div key={`step-${stepIndex}`} className="space-y-1">
            {/* For first step, show both operands */}
            {stepIndex === 0 && (
              <>
                {renderBitRow(step.operand1, undefined, false, true, `${step.operand1}_${stepIndex}_0`)}
                {step.operand2 !== undefined && 
                  renderBitRow(step.operand2, step.operator, false, true, `${step.operand2}_${stepIndex}_1`)
                }
              </>
            )}
            
            {/* For subsequent steps, only show the new operand */}
            {stepIndex > 0 && step.operand2 !== undefined && 
              renderBitRow(step.operand2, step.operator, false, true, `${step.operand2}_${stepIndex}_0`)
            }
            
            {/* Separator line */}
            <div className="flex items-center px-3">
              <div className="w-[180px] pr-4 flex-shrink-0"></div>
              <div className="w-[360px] px-4 flex-shrink-0">
                <div className="border-t border-border border-dashed"></div>
              </div>
              <div className="w-[250px] pl-4 flex-shrink-0"></div>
            </div>
            
            {/* Result */}
            {renderBitRow(step.result, "=", true, false)}
          </div>
        ))}
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
    <>
      <div className="w-full space-y-8 mt-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* Expression input */}
          <div className="space-y-3">
            <Label htmlFor="expression" className="text-base font-medium">Expression</Label>
            <div className="flex gap-2">
              <Input
                id="expression"
                placeholder="Enter expression like '15 & 7 | 3' and press Enter"
                value={expression}
                onChange={(e) => handleExpressionChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="font-mono text-base"
                disabled={isProcessing}
              />
              {onToggleCalculator && (
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={onToggleCalculator}
                  className={`flex-shrink-0 ${isCalculatorOpen ? "bg-accent text-accent-foreground" : ""}`}
                  title={isCalculatorOpen ? "Close Calculator" : "Open Calculator"}
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              )}
              <Button onClick={handleExpressionSubmit} disabled={isProcessing}>
                Calculate
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="flex gap-6">
            <div className="space-y-2">
              <Label htmlFor="base" className="text-sm font-medium">Base</Label>
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
              <Label htmlFor="bitwidth" className="text-sm font-medium">Bit Width</Label>
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
        <div className="space-y-6">
          {/* Error display */}
          {evaluationResult && !evaluationResult.parsed.isValid && renderError()}
          
          {/* Help display */}
          {expression.toLowerCase().trim() === "help" && renderHelp()}
          
          {/* Results display */}
          {evaluationResult?.result.isValid && (
            <div className="space-y-6">
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
            <div className="text-center text-muted-foreground py-12">
              <p>Enter an expression above and press Enter</p>
              <p className="text-sm mt-2">
                Try: <code className="cursor-pointer hover:text-primary" onClick={() => setExpression("15 & 7")}>15 & 7</code> or type <code>help</code> for examples
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Calculator Panel */}
      <Sheet open={isCalculatorOpen} onOpenChange={onToggleCalculator}>
        <SheetContent className="w-[480px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Calculator</SheetTitle>
            <SheetDescription>
              Use the calculator to build expressions and see instant results
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full">
            {calculatorContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
