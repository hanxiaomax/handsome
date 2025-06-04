import { Button } from "@/components/ui/button";
import type { Base, CalculatorMode, ButtonConfig } from "../types";

interface ButtonGridProps {
  base: Base;
  mode: CalculatorMode;
  onButtonClick: (value: string, type: ButtonConfig["type"]) => void;
}

export function ButtonGrid({ base, mode, onButtonClick }: ButtonGridProps) {
  const getButtonConfig = (): ButtonConfig[][] => {
    if (mode === "programmer") {
      return [
        // Row 1: Bitwise operations and clear
        [
          {
            label: "AND",
            value: "&",
            type: "operation",
            className: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600",
          },
          {
            label: "OR",
            value: "|",
            type: "operation",
            className: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600",
          },
          {
            label: "XOR",
            value: "^",
            type: "operation",
            className: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600",
          },
          {
            label: "NOT",
            value: "~",
            type: "operation",
            className: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600",
          },
          {
            label: "<<",
            value: "<<",
            type: "operation",
            className: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600",
          },
          {
            label: ">>",
            value: ">>",
            type: "operation",
            className: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600",
          },
          { label: "(", value: "(", type: "special" },
          { label: ")", value: ")", type: "special" },
          {
            label: "C",
            value: "clear",
            type: "special",
            className: "bg-red-500/10 hover:bg-red-500/20 text-red-600",
          },
        ],
        // Row 2: Hex digits and operations
        [
          { label: "A", value: "A", type: "number", disabled: base < 16 },
          { label: "B", value: "B", type: "number", disabled: base < 16 },
          { label: "C", value: "C", type: "number", disabled: base < 16 },
          { label: "D", value: "D", type: "number", disabled: base < 16 },
          { label: "E", value: "E", type: "number", disabled: base < 16 },
          { label: "F", value: "F", type: "number", disabled: base < 16 },
          {
            label: "÷",
            value: "/",
            type: "operation",
            className:
              "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600",
          },
          {
            label: "×",
            value: "*",
            type: "operation",
            className:
              "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600",
          },
          {
            label: "⌫",
            value: "backspace",
            type: "special",
            className: "bg-gray-500/10 hover:bg-gray-500/20",
          },
        ],
        // Row 3: Numbers and basic operations
        [
          { label: "7", value: "7", type: "number", disabled: base < 8 },
          { label: "8", value: "8", type: "number", disabled: base < 10 },
          { label: "9", value: "9", type: "number", disabled: base < 10 },
          {
            label: "+",
            value: "+",
            type: "operation",
            className:
              "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600",
          },
          {
            label: "−",
            value: "-",
            type: "operation",
            className:
              "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600",
          },
          {
            label: "%",
            value: "%",
            type: "operation",
            className:
              "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600",
          },
          { label: "±", value: "negate", type: "function" },
          { label: "(", value: "(", type: "special" },
          { label: ")", value: ")", type: "special" },
        ],
        // Row 4: Numbers
        [
          { label: "4", value: "4", type: "number", disabled: base < 8 },
          { label: "5", value: "5", type: "number", disabled: base < 8 },
          { label: "6", value: "6", type: "number", disabled: base < 8 },
          { label: "1", value: "1", type: "number", disabled: base < 2 },
          { label: "2", value: "2", type: "number", disabled: base < 8 },
          { label: "3", value: "3", type: "number", disabled: base < 8 },
          { label: "0", value: "0", type: "number" },
          { label: ".", value: ".", type: "number" },
          {
            label: "=",
            value: "=",
            type: "operation",
            className:
              "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
          },
        ],
      ];
    } else {
      // Scientific mode layout
      return [
        [
          { label: "sin", value: "sin", type: "function" },
          { label: "cos", value: "cos", type: "function" },
          { label: "tan", value: "tan", type: "function" },
          { label: "log", value: "log", type: "function" },
          { label: "ln", value: "ln", type: "function" },
          { label: "√", value: "sqrt", type: "function" },
          { label: "x²", value: "square", type: "function" },
          { label: "x³", value: "cube", type: "function" },
          { label: "C", value: "clear", type: "special" },
        ],
        [
          { label: "7", value: "7", type: "number" },
          { label: "8", value: "8", type: "number" },
          { label: "9", value: "9", type: "number" },
          { label: "÷", value: "/", type: "operation" },
          { label: "×", value: "*", type: "operation" },
          { label: "−", value: "-", type: "operation" },
          { label: "+", value: "+", type: "operation" },
          { label: "=", value: "=", type: "operation" },
          { label: "⌫", value: "backspace", type: "special" },
        ],
        [
          { label: "4", value: "4", type: "number" },
          { label: "5", value: "5", type: "number" },
          { label: "6", value: "6", type: "number" },
          { label: "1", value: "1", type: "number" },
          { label: "2", value: "2", type: "number" },
          { label: "3", value: "3", type: "number" },
          { label: "0", value: "0", type: "number" },
          { label: ".", value: ".", type: "number" },
          { label: "±", value: "negate", type: "function" },
        ],
      ];
    }
  };

  const buttonRows = getButtonConfig();

  return (
    <div className="space-y-1">
      {buttonRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-9 gap-1">
          {row.map((button, buttonIndex) => (
            <Button
              key={`${rowIndex}-${buttonIndex}`}
              variant="outline"
              size="sm"
              disabled={button.disabled}
              className={`h-10 font-mono text-xs ${button.className || ""}`}
              onClick={() => onButtonClick(button.value, button.type)}
            >
              {button.label}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
