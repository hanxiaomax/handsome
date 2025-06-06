import { useState, useCallback, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputWithCalculatorProps {
  value?: string | number;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  calculatorButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  calculatorButtonSize?: "default" | "sm" | "lg" | "icon";
  onValueChange?: (value: number) => void;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: "number" | "text";
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Input with Calculator Component
 * A shared input component with an integrated scientific calculator
 */
export const InputWithCalculator = forwardRef<
  HTMLInputElement,
  InputWithCalculatorProps
>(
  (
    {
      value = "",
      placeholder = "Enter value...",
      className,
      inputClassName,
      calculatorButtonVariant = "outline",
      calculatorButtonSize = "sm",
      onValueChange,
      onInputChange,
      disabled = false,
      type = "number",
      min,
      max,
      step,
      ...props
    },
    ref
  ) => {
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [display, setDisplay] = useState("0");
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [waitingForNewValue, setWaitingForNewValue] = useState(false);

    // Handle input change
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        if (onInputChange) {
          onInputChange(e);
        }

        if (onValueChange && type === "number") {
          const numValue = parseFloat(inputValue);
          if (!isNaN(numValue)) {
            onValueChange(numValue);
          } else if (inputValue === "") {
            onValueChange(0);
          }
        }
      },
      [onInputChange, onValueChange, type]
    );

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

    // Apply calculator result to input
    const applyCalculatorResult = useCallback(() => {
      const calculatedValue = parseFloat(display);
      if (!isNaN(calculatedValue) && onValueChange) {
        onValueChange(calculatedValue);
      }
      setIsCalculatorOpen(false);
    }, [display, onValueChange]);

    // Backspace function
    const backspace = useCallback(() => {
      setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    }, []);

    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Input Field */}
        <Input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          className={cn("flex-1", inputClassName)}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          {...props}
        />

        {/* Calculator Button and Popover */}
        <Popover open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={calculatorButtonVariant}
              size={calculatorButtonSize}
              disabled={disabled}
              type="button"
            >
              <Calculator className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              {/* Calculator Header */}
              <div className="text-center">
                <h4 className="font-medium mb-2">Scientific Calculator</h4>
                <p className="text-xs text-muted-foreground">
                  Click "Apply" to use the calculated value
                </p>
              </div>

              {/* Calculator Display */}
              <div className="bg-muted p-3 rounded text-right font-mono text-lg min-h-[3rem] flex items-center justify-end border">
                {display}
              </div>

              {/* Scientific Functions */}
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

              {/* Basic Calculator Operations */}
              <div className="grid grid-cols-4 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  type="button"
                >
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
                  -
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
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCalculatorOpen(false)}
                  className="flex-1"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={applyCalculatorResult}
                  className="flex-1"
                  type="button"
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

InputWithCalculator.displayName = "InputWithCalculator";
