import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalculatorProps {
  // Calculator behavior
  initialValue?: number | string;
  onValueChange?: (value: number, formattedValue: string) => void;
  onCalculationComplete?: (result: number) => void;

  // Data binding
  bindToFocusedInput?: boolean;
  autoApply?: boolean;
  realTimeBinding?: boolean;

  // Display options
  decimalPlaces?: number;

  // Layout customization
  className?: string;
}

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForNewValue: boolean;
  expression: string;
}

/**
 * Simple Calculator Panel Component
 * A pure calculator panel without any container or layout functionality.
 * Use this component inside your own containers/layouts.
 */
export function Calculator({
  initialValue = 0,
  onValueChange,
  onCalculationComplete,
  bindToFocusedInput = false,
  autoApply = false,
  realTimeBinding = false,
  decimalPlaces,
  className,
}: CalculatorProps) {
  const [state, setState] = useState<CalculatorState>({
    display: initialValue.toString(),
    previousValue: null,
    operation: null,
    waitingForNewValue: false,
    expression: initialValue.toString(),
  });

  const [focusedInput, setFocusedInput] = useState<HTMLInputElement | null>(
    null
  );

  // Refs for auto-scrolling to the right
  const expressionRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  // Auto scroll to right when expression or display changes
  useEffect(() => {
    if (expressionRef.current) {
      expressionRef.current.scrollLeft = expressionRef.current.scrollWidth;
    }
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [state.expression, state.display]);

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
    (value: number) => {
      const formattedValue = formatValue(value);

      onValueChange?.(value, formattedValue);
      onCalculationComplete?.(value);

      // Real-time binding to focused input
      if (realTimeBinding && focusedInput) {
        focusedInput.value = formattedValue;
        const event = new Event("input", { bubbles: true });
        focusedInput.dispatchEvent(event);
      }

      // Auto-apply to focused input
      if (autoApply && focusedInput) {
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
      autoApply,
      focusedInput,
    ]
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

  // Calculator functions
  const inputNumber = useCallback(
    (num: string) => {
      setState((prevState) => {
        const newDisplay = prevState.waitingForNewValue
          ? num
          : prevState.display === "0"
          ? num
          : prevState.display + num;

        // Update expression based on context
        let newExpression;
        if (prevState.waitingForNewValue) {
          // Starting new number after operation
          newExpression = prevState.expression + num;
        } else if (prevState.display === "0") {
          // Replacing initial zero
          newExpression =
            prevState.expression === "0"
              ? num
              : prevState.expression.slice(0, -1) + num;
        } else {
          // Appending to current number
          newExpression = prevState.expression + num;
        }

        const value = parseFloat(newDisplay);
        if (realTimeBinding && !isNaN(value)) {
          notifyValueChange(value);
        }

        return {
          ...prevState,
          display: newDisplay,
          expression: newExpression,
          waitingForNewValue: false,
        };
      });
    },
    [realTimeBinding, notifyValueChange]
  );

  const inputDecimal = useCallback(() => {
    setState((prevState) => {
      let newDisplay;
      let newExpression;

      if (prevState.waitingForNewValue) {
        newDisplay = "0.";
        newExpression = prevState.expression + "0.";
      } else if (prevState.display.indexOf(".") === -1) {
        newDisplay = prevState.display + ".";
        newExpression = prevState.expression + ".";
      } else {
        return prevState; // Already has decimal
      }

      return {
        ...prevState,
        display: newDisplay,
        expression: newExpression,
        waitingForNewValue: false,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState({
      display: "0",
      previousValue: null,
      operation: null,
      waitingForNewValue: false,
      expression: "0",
    });
  }, []);

  const performOperation = useCallback(
    (nextOperation: string) => {
      setState((prevState) => {
        const inputValue = parseFloat(prevState.display);
        const newState = { ...prevState };

        if (prevState.previousValue === null) {
          newState.previousValue = inputValue;
          newState.expression =
            prevState.expression + " " + nextOperation + " ";
        } else if (prevState.operation && nextOperation !== "=") {
          const currentValue = prevState.previousValue || 0;
          let result;

          switch (prevState.operation) {
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

          newState.display = String(result);
          newState.previousValue = result;
          newState.expression =
            prevState.expression + " " + nextOperation + " ";

          // Notify of calculation result
          notifyValueChange(result);
        }

        newState.waitingForNewValue = true;
        newState.operation = nextOperation === "=" ? null : nextOperation;

        if (nextOperation === "=") {
          newState.previousValue = null;
          newState.expression = prevState.expression + " = " + newState.display;
        }

        return newState;
      });
    },
    [notifyValueChange]
  );

  const calculate = useCallback(() => {
    setState((prevState) => {
      if (prevState.operation && prevState.previousValue !== null) {
        const inputValue = parseFloat(prevState.display);
        const currentValue = prevState.previousValue || 0;
        let result;

        switch (prevState.operation) {
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

        // Notify of calculation result
        notifyValueChange(result);

        return {
          display: String(result),
          previousValue: null,
          operation: null,
          waitingForNewValue: true,
          expression: prevState.expression + " = " + String(result),
        };
      }
      return prevState;
    });
  }, [notifyValueChange]);

  const performFunction = useCallback(
    (func: string) => {
      setState((prevState) => {
        const value = parseFloat(prevState.display);
        let result;
        let functionExpression;

        switch (func) {
          case "sin":
            result = Math.sin((value * Math.PI) / 180);
            functionExpression = `sin(${value})`;
            break;
          case "cos":
            result = Math.cos((value * Math.PI) / 180);
            functionExpression = `cos(${value})`;
            break;
          case "tan":
            result = Math.tan((value * Math.PI) / 180);
            functionExpression = `tan(${value})`;
            break;
          case "ln":
            result = value > 0 ? Math.log(value) : 0;
            functionExpression = `ln(${value})`;
            break;
          case "log":
            result = value > 0 ? Math.log10(value) : 0;
            functionExpression = `log(${value})`;
            break;
          case "√":
            result = value >= 0 ? Math.sqrt(value) : 0;
            functionExpression = `√(${value})`;
            break;
          case "x²":
            result = value * value;
            functionExpression = `(${value})²`;
            break;
          case "1/x":
            result = value !== 0 ? 1 / value : 0;
            functionExpression = `1/(${value})`;
            break;
          case "π":
            result = Math.PI;
            functionExpression = "π";
            break;
          case "e":
            result = Math.E;
            functionExpression = "e";
            break;
          default:
            return prevState;
        }

        // Notify of calculation result
        notifyValueChange(result);

        return {
          ...prevState,
          display: String(result),
          expression: functionExpression + " = " + String(result),
          waitingForNewValue: true,
        };
      });
    },
    [notifyValueChange]
  );

  return (
    <div
      className={cn("bg-background border rounded-lg p-4 space-y-4", className)}
    >
      {/* Display */}
      <div className="bg-muted p-3 rounded border space-y-1">
        {/* Expression line - smaller text with horizontal scroll */}
        <div className="relative w-full min-h-[1.5rem]">
          <div
            ref={expressionRef}
            className="absolute inset-0 text-right font-mono text-sm text-muted-foreground flex items-center justify-end overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
          >
            <span className="inline-block">{state.expression || "0"}</span>
          </div>
        </div>
        {/* Current value line - larger text with horizontal scroll */}
        <div className="relative w-full min-h-[2rem]">
          <div
            ref={displayRef}
            className="absolute inset-0 text-right font-mono text-lg flex items-center justify-end overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
          >
            <span className="inline-block">{state.display}</span>
          </div>
        </div>
      </div>

      {/* Scientific Functions */}
      <div className="grid grid-cols-5 gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => performFunction("sin")}
        >
          sin
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performFunction("cos")}
        >
          cos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performFunction("tan")}
        >
          tan
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performFunction("ln")}
        >
          ln
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performFunction("log")}
        >
          log
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => performFunction("√")}
        >
          √
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performFunction("x²")}
        >
          x²
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performFunction("1/x")}
        >
          1/x
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performFunction("π")}
        >
          π
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performFunction("e")}
        >
          e
        </Button>
      </div>

      {/* Basic Calculator */}
      <div className="grid grid-cols-4 gap-1">
        <Button variant="outline" size="sm" onClick={clear}>
          C
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performOperation("^")}
        >
          x^y
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performOperation("÷")}
        >
          ÷
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() =>
            setState((prevState) => {
              const newDisplay = prevState.display.slice(0, -1) || "0";
              const newExpression = prevState.expression.slice(0, -1) || "0";
              return {
                ...prevState,
                display: newDisplay,
                expression: newExpression,
              };
            })
          }
        >
          ⌫
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-1">
        <Button variant="outline" size="sm" onClick={() => inputNumber("7")}>
          7
        </Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber("8")}>
          8
        </Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber("9")}>
          9
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performOperation("×")}
        >
          ×
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-1">
        <Button variant="outline" size="sm" onClick={() => inputNumber("4")}>
          4
        </Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber("5")}>
          5
        </Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber("6")}>
          6
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performOperation("-")}
        >
          -
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-1">
        <Button variant="outline" size="sm" onClick={() => inputNumber("1")}>
          1
        </Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber("2")}>
          2
        </Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber("3")}>
          3
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => performOperation("+")}
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
        >
          0
        </Button>
        <Button variant="outline" size="sm" onClick={inputDecimal}>
          .
        </Button>
        <Button variant="outline" size="sm" onClick={calculate}>
          =
        </Button>
      </div>
    </div>
  );
}
