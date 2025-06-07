import { useState, useCallback, useEffect } from "react";
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
  });

  const [focusedInput, setFocusedInput] = useState<HTMLInputElement | null>(
    null
  );

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

        const value = parseFloat(newDisplay);
        if (realTimeBinding && !isNaN(value)) {
          notifyValueChange(value);
        }

        return {
          ...prevState,
          display: newDisplay,
          waitingForNewValue: false,
        };
      });
    },
    [realTimeBinding, notifyValueChange]
  );

  const inputDecimal = useCallback(() => {
    setState((prevState) => {
      let newDisplay;
      if (prevState.waitingForNewValue) {
        newDisplay = "0.";
      } else if (prevState.display.indexOf(".") === -1) {
        newDisplay = prevState.display + ".";
      } else {
        return prevState; // Already has decimal
      }

      return {
        ...prevState,
        display: newDisplay,
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
    });
  }, []);

  const performOperation = useCallback(
    (nextOperation: string) => {
      setState((prevState) => {
        const inputValue = parseFloat(prevState.display);
        const newState = { ...prevState };

        if (prevState.previousValue === null) {
          newState.previousValue = inputValue;
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

          // Notify of calculation result
          notifyValueChange(result);
        }

        newState.waitingForNewValue = true;
        newState.operation = nextOperation === "=" ? null : nextOperation;

        if (nextOperation === "=") {
          newState.previousValue = null;
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
            return prevState;
        }

        // Notify of calculation result
        notifyValueChange(result);

        return {
          ...prevState,
          display: String(result),
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
      <div className="bg-muted p-3 rounded text-right font-mono text-lg min-h-[3rem] flex items-center justify-end border">
        {state.display}
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
            setState((prevState) => ({
              ...prevState,
              display: prevState.display.slice(0, -1) || "0",
            }))
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
