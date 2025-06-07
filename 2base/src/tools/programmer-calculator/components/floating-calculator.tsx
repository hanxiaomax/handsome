import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calculator } from "lucide-react";
import type { Base, CalculatorMode, ButtonConfig } from "../types";

interface FloatingCalculatorProps {
  // Props are kept for compatibility but not used in the new implementation
  base?: Base;
  mode?: CalculatorMode;
  onButtonClick?: (value: string, type: ButtonConfig["type"]) => void;
}

export function FloatingCalculator(_props: FloatingCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [focusedInput, setFocusedInput] = useState<HTMLInputElement | null>(
    null
  );

  // Track focused input elements
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement && target.type === "number") {
        setFocusedInput(target);
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement && target === focusedInput) {
        // Keep the reference for a short time in case user wants to apply calculator result
        setTimeout(() => {
          if (document.activeElement !== target) {
            setFocusedInput(null);
          }
        }, 500);
      }
    };

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, [focusedInput]);

  // Calculator functions
  const inputNumber = useCallback(
    (num: string) => {
      if (waitingForNewValue) {
        setDisplay(num);
        setWaitingForNewValue(false);
      } else {
        setDisplay(display === "0" ? num : display + num);
      }
    },
    [display, waitingForNewValue]
  );

  const inputDecimal = useCallback(() => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  }, [display, waitingForNewValue]);

  const clear = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  }, []);

  const performOperation = useCallback(
    (nextOperation: string) => {
      const inputValue = parseFloat(display);

      if (previousValue === null) {
        setPreviousValue(inputValue);
      } else if (operation) {
        const currentValue = previousValue || 0;
        let result;

        switch (operation) {
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
            return;
        }

        setDisplay(String(result));
        setPreviousValue(result);
      }

      setWaitingForNewValue(true);
      setOperation(nextOperation);
    },
    [display, previousValue, operation]
  );

  const calculate = useCallback(() => {
    if (operation && previousValue !== null) {
      performOperation("=");
      setOperation(null);
      setPreviousValue(null);
      setWaitingForNewValue(true);
    }
  }, [operation, previousValue, performOperation]);

  const performFunction = useCallback(
    (func: string) => {
      const value = parseFloat(display);
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
          return;
      }

      setDisplay(String(result));
      setWaitingForNewValue(true);
    },
    [display]
  );

  // Apply calculator result to focused input
  const applyToFocusedInput = useCallback(() => {
    if (focusedInput) {
      const calculatedValue = parseFloat(display);
      if (!isNaN(calculatedValue)) {
        // Set the value
        focusedInput.value = calculatedValue.toString();

        // Trigger input event to notify React
        const event = new Event("input", { bubbles: true });
        focusedInput.dispatchEvent(event);

        // Trigger change event for good measure
        const changeEvent = new Event("change", { bubbles: true });
        focusedInput.dispatchEvent(changeEvent);
      }
    }
    setOpen(false);
  }, [display, focusedInput]);

  // Backspace function
  const backspace = useCallback(() => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 bg-primary hover:bg-primary/90"
            title="Open Calculator"
          >
            <Calculator className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 mr-4 mb-4" align="end" side="top">
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium mb-2">Scientific Calculator</h4>
              <p className="text-xs text-muted-foreground">
                {focusedInput
                  ? "Ready to apply to focused input"
                  : "Focus an input field"}
              </p>
            </div>

            {/* Calculator Display */}
            <div className="w-full">
              <div className="text-right text-xl font-mono font-bold min-h-[2rem] bg-muted/30 rounded px-3 py-2 border mb-4">
                {display}
              </div>

              {/* Scientific Functions */}
              <div className="grid grid-cols-4 gap-1 mb-4">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => performOperation("^")}
                  type="button"
                >
                  x^y
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clear}
                  type="button"
                >
                  C
                </Button>
              </div>

              {/* Basic Calculator */}
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
                  onClick={() => performOperation("÷")}
                  type="button"
                >
                  ÷
                </Button>

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
                  onClick={() => performOperation("×")}
                  type="button"
                >
                  ×
                </Button>

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
                  onClick={() => performOperation("-")}
                  type="button"
                >
                  −
                </Button>

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
                  onClick={() => performOperation("+")}
                  type="button"
                >
                  +
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={calculate}
                  type="button"
                >
                  =
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={backspace}
                  type="button"
                >
                  ⌫
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="col-span-2"
                  onClick={applyToFocusedInput}
                  disabled={!focusedInput}
                  type="button"
                >
                  Apply to Input
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
