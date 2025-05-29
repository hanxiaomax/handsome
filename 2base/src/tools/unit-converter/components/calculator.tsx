import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calculator } from "lucide-react";

interface CalculatorProps {
  onValueSelect: (value: number) => void;
}

export function ScientificCalculator({ onValueSelect }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: string) => {
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
  };

  const calculate = () => {
    if (operation && previousValue !== null) {
      performOperation("=");
      setOperation(null);
      setPreviousValue(null);
      setWaitingForNewValue(true);
    }
  };

  const performFunction = (func: string) => {
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
  };

  const useValue = () => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      onValueSelect(value);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Calculator className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="font-medium mb-2">Scientific Calculator</h4>
          </div>

          {/* Display */}
          <div className="bg-muted p-3 rounded text-right font-mono text-lg min-h-[3rem] flex items-center justify-end">
            {display}
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
              onClick={() => setDisplay(display.slice(0, -1) || "0")}
            >
              ⌫
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("7")}
            >
              7
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("8")}
            >
              8
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("9")}
            >
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("4")}
            >
              4
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("5")}
            >
              5
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("6")}
            >
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("1")}
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("2")}
            >
              2
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputNumber("3")}
            >
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

          {/* Use Value Button */}
          <Button onClick={useValue} className="w-full">
            Use Value: {display}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
