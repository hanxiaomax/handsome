import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calculator as CalculatorIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalculatorProps {
  // Trigger button customization
  triggerVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  triggerSize?: "default" | "sm" | "lg" | "icon";
  triggerClassName?: string;
  triggerText?: string;
  showIcon?: boolean;

  // Calculator behavior
  initialValue?: number | string;
  onValueChange?: (value: number, formattedValue: string) => void;
  onCalculationComplete?: (result: number, expression: string) => void;

  // Data binding
  bindToFocusedInput?: boolean;
  autoApply?: boolean;
  realTimeBinding?: boolean;

  // Display options
  decimalPlaces?: number;
  showExpression?: boolean;

  // Layout customization
  calculatorClassName?: string;
  popoverAlign?: "start" | "center" | "end";
  popoverSide?: "top" | "right" | "bottom" | "left";

  disabled?: boolean;
}

interface CalculatorState {
  display: string;
  expression: string;
  previousValue: number | null;
  operation: string | null;
  waitingForNewValue: boolean;
}

/**
 * Calculator Component
 * A standalone, reusable scientific calculator with data binding capabilities
 */
export function Calculator({
  triggerVariant = "outline",
  triggerSize = "sm",
  triggerClassName,
  triggerText,
  showIcon = true,
  initialValue = 0,
  onValueChange,
  onCalculationComplete,
  bindToFocusedInput = false,
  autoApply = false,
  realTimeBinding = false,
  decimalPlaces,
  showExpression = false,
  calculatorClassName,
  popoverAlign = "center",
  popoverSide = "bottom",
  disabled = false,
}: CalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<CalculatorState>({
    display: initialValue.toString(),
    expression: "",
    previousValue: null,
    operation: null,
    waitingForNewValue: false,
  });

  const [focusedInput, setFocusedInput] = useState<HTMLInputElement | null>(
    null
  );

  // Track focused input elements when bindToFocusedInput is enabled
  useEffect(() => {
    if (!bindToFocusedInput) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement &&
        (target.type === "number" || target.type === "text")
      ) {
        setFocusedInput(target);
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement && target === focusedInput) {
        setTimeout(() => {
          if (document.activeElement !== target) {
            setFocusedInput(null);
          }
        }, 300);
      }
    };

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, [bindToFocusedInput, focusedInput]);

  // Format display value
  const formatValue = useCallback(
    (value: number): string => {
      if (decimalPlaces !== undefined) {
        return value.toFixed(decimalPlaces);
      }
      return value.toString();
    },
    [decimalPlaces]
  );

  // Notify value change
  const notifyValueChange = useCallback(
    (value: number, expression?: string) => {
      const formattedValue = formatValue(value);

      onValueChange?.(value, formattedValue);

      if (expression) {
        onCalculationComplete?.(value, expression);
      }

      // Real-time binding to focused input
      if (realTimeBinding && focusedInput) {
        focusedInput.value = formattedValue;
        const event = new Event("input", { bubbles: true });
        focusedInput.dispatchEvent(event);
      }
    },
    [
      formatValue,
      onValueChange,
      onCalculationComplete,
      realTimeBinding,
      focusedInput,
    ]
  );

  // Calculator functions
  const inputNumber = useCallback(
    (num: string) => {
      setState((prev) => {
        const newDisplay = prev.waitingForNewValue
          ? num
          : prev.display === "0"
          ? num
          : prev.display + num;

        const value = parseFloat(newDisplay);
        if (realTimeBinding && !isNaN(value)) {
          notifyValueChange(value);
        }

        return {
          ...prev,
          display: newDisplay,
          waitingForNewValue: false,
        };
      });
    },
    [realTimeBinding, notifyValueChange]
  );

  const inputDecimal = useCallback(() => {
    setState((prev) => {
      let newDisplay;
      if (prev.waitingForNewValue) {
        newDisplay = "0.";
      } else if (prev.display.indexOf(".") === -1) {
        newDisplay = prev.display + ".";
      } else {
        return prev; // Already has decimal
      }

      return {
        ...prev,
        display: newDisplay,
        waitingForNewValue: false,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState((prev) => ({
      ...prev,
      display: "0",
      expression: "",
      previousValue: null,
      operation: null,
      waitingForNewValue: false,
    }));
  }, []);

  const performOperation = useCallback(
    (nextOperation: string) => {
      setState((prev) => {
        const inputValue = parseFloat(prev.display);
        let newState = { ...prev };

        if (prev.previousValue === null) {
          newState.previousValue = inputValue;
          newState.expression = `${inputValue} ${nextOperation}`;
        } else if (prev.operation && nextOperation !== "=") {
          const currentValue = prev.previousValue || 0;
          let result;

          switch (prev.operation) {
            case "+":
              result = currentValue + inputValue;
              break;
            case "-":
              result = currentValue - inputValue;
              break;
            case "×":
              result = currentValue * inputValue;
              break;
            case "÷":
              result = inputValue !== 0 ? currentValue / inputValue : 0;
              break;
            case "^":
              result = Math.pow(currentValue, inputValue);
              break;
            default:
              result = inputValue;
          }

          newState.display = result.toString();
          newState.previousValue = result;
          newState.expression = `${result} ${nextOperation}`;

          if (nextOperation === "=" || autoApply) {
            notifyValueChange(
              result,
              `${currentValue} ${prev.operation} ${inputValue} = ${result}`
            );
          }
        }

        newState.waitingForNewValue = true;
        newState.operation = nextOperation === "=" ? null : nextOperation;

        if (nextOperation === "=") {
          newState.expression = "";
          newState.previousValue = null;
        }

        return newState;
      });
    },
    [notifyValueChange, autoApply]
  );

  const calculate = useCallback(() => {
    performOperation("=");
  }, [performOperation]);

  const performFunction = useCallback(
    (func: string) => {
      setState((prev) => {
        const value = parseFloat(prev.display);
        let result;

        switch (func) {
          case "sin":
            result = Math.sin((value * Math.PI) / 180);
            break;
          case "cos":
            result = Math.cos((value * Math.PI) / 180);
            break;
          case "tan":
            result = Math.tan((value * Math.PI) / 180);
            break;
          case "ln":
            result = value > 0 ? Math.log(value) : 0;
            break;
          case "log":
            result = value > 0 ? Math.log10(value) : 0;
            break;
          case "√":
            result = value >= 0 ? Math.sqrt(value) : 0;
            break;
          case "x²":
            result = value * value;
            break;
          case "1/x":
            result = value !== 0 ? 1 / value : 0;
            break;
          case "π":
            result = Math.PI;
            break;
          case "e":
            result = Math.E;
            break;
          default:
            return prev;
        }

        const expression = `${func}(${value}) = ${result}`;

        if (autoApply) {
          notifyValueChange(result, expression);
        }

        return {
          ...prev,
          display: result.toString(),
          expression: showExpression ? expression : "",
          waitingForNewValue: true,
        };
      });
    },
    [notifyValueChange, autoApply, showExpression]
  );

  // Apply result to focused input or callback
  const applyResult = useCallback(() => {
    const value = parseFloat(state.display);

    if (!isNaN(value)) {
      notifyValueChange(value, state.expression);

      // Apply to focused input if binding is enabled
      if (bindToFocusedInput && focusedInput) {
        const formattedValue = formatValue(value);
        focusedInput.value = formattedValue;

        // Trigger React events
        const inputEvent = new Event("input", { bubbles: true });
        const changeEvent = new Event("change", { bubbles: true });
        focusedInput.dispatchEvent(inputEvent);
        focusedInput.dispatchEvent(changeEvent);
      }
    }

    setIsOpen(false);
  }, [
    state.display,
    state.expression,
    notifyValueChange,
    bindToFocusedInput,
    focusedInput,
    formatValue,
  ]);

  // Backspace function
  const backspace = useCallback(() => {
    setState((prev) => ({
      ...prev,
      display: prev.display.length > 1 ? prev.display.slice(0, -1) : "0",
    }));
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          disabled={disabled}
          className={cn("gap-2", triggerClassName)}
          type="button"
        >
          {showIcon && <CalculatorIcon className="h-4 w-4" />}
          {triggerText && <span>{triggerText}</span>}
          {!triggerText && !showIcon && "Calculator"}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn("w-80 p-4", calculatorClassName)}
        align={popoverAlign}
        side={popoverSide}
      >
        <div className="space-y-4">
          {/* Calculator Header */}
          <div className="text-center">
            <h4 className="font-medium mb-1">Scientific Calculator</h4>
            {bindToFocusedInput && (
              <p className="text-xs text-muted-foreground">
                {focusedInput
                  ? "Ready to apply to focused input"
                  : "Focus an input field to auto-apply"}
              </p>
            )}
            {showExpression && state.expression && (
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {state.expression}
              </p>
            )}
          </div>

          {/* Calculator Display */}
          <div className="bg-muted p-3 rounded text-right font-mono text-lg min-h-[3rem] flex items-center justify-end border">
            {state.display}
          </div>

          {/* Scientific Functions Row 1 */}
          <div className="grid grid-cols-5 gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => performFunction("sin")}
              type="button"
            >
              sin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performFunction("cos")}
              type="button"
            >
              cos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performFunction("tan")}
              type="button"
            >
              tan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performFunction("ln")}
              type="button"
            >
              ln
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performFunction("log")}
              type="button"
            >
              log
            </Button>
          </div>

          {/* Scientific Functions Row 2 */}
          <div className="grid grid-cols-5 gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => performFunction("√")}
              type="button"
            >
              √
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performFunction("x²")}
              type="button"
            >
              x²
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performFunction("1/x")}
              type="button"
            >
              1/x
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performFunction("π")}
              type="button"
            >
              π
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performFunction("e")}
              type="button"
            >
              e
            </Button>
          </div>

          {/* Basic Operations Row 1 */}
          <div className="grid grid-cols-4 gap-1">
            <Button variant="outline" size="sm" onClick={clear} type="button">
              C
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performOperation("^")}
              type="button"
            >
              x^y
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performOperation("÷")}
              type="button"
            >
              ÷
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={backspace}
              type="button"
            >
              ⌫
            </Button>
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-4 gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("7")}
              type="button"
            >
              7
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("8")}
              type="button"
            >
              8
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("9")}
              type="button"
            >
              9
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performOperation("×")}
              type="button"
            >
              ×
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("4")}
              type="button"
            >
              4
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("5")}
              type="button"
            >
              5
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("6")}
              type="button"
            >
              6
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performOperation("-")}
              type="button"
            >
              −
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("1")}
              type="button"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("2")}
              type="button"
            >
              2
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("3")}
              type="button"
            >
              3
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performOperation("+")}
              type="button"
            >
              +
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-1">
            <Button
              variant="outline"
              size="sm"
              className="col-span-2"
              onClick={() => inputNumber("0")}
              type="button"
            >
              0
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={inputDecimal}
              type="button"
            >
              .
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={calculate}
              type="button"
            >
              =
            </Button>
          </div>

          {/* Action Buttons */}
          {!autoApply && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={applyResult}
                className="flex-1"
                type="button"
                disabled={bindToFocusedInput && !focusedInput}
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
