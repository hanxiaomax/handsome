import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";
import type { Base } from "../types";

interface CalculatorButton {
  label: string;
  value: string;
  type: "number" | "operation" | "function" | "special";
  disabled?: boolean;
  icon?: boolean;
}

interface CalculatorGridProps {
  base: Base;
  onButtonClick: (
    value: string,
    type: "number" | "operation" | "function" | "special"
  ) => void;
  onClear: () => void;
}

export function CalculatorGrid({
  base,
  onButtonClick,
  onClear,
}: CalculatorGridProps) {
  // Calculator button grid - organized by function
  const buttonGrid: CalculatorButton[][] = [
    // Row 1: Bit Operations
    [
      { label: "NOT", value: "~", type: "function" as const },
      { label: "AND", value: "&", type: "function" as const },
      { label: "OR", value: "|", type: "function" as const },
      { label: "XOR", value: "^", type: "function" as const },
      { label: "<<", value: "<<", type: "function" as const },
      { label: ">>", value: ">>", type: "function" as const },
    ],
    // Row 2: Hex Digits
    [
      { label: "A", value: "A", type: "number" as const, disabled: base < 16 },
      { label: "B", value: "B", type: "number" as const, disabled: base < 16 },
      { label: "C", value: "C", type: "number" as const, disabled: base < 16 },
      { label: "D", value: "D", type: "number" as const, disabled: base < 16 },
      { label: "E", value: "E", type: "number" as const, disabled: base < 16 },
      { label: "F", value: "F", type: "number" as const, disabled: base < 16 },
    ],
    // Row 3: Numbers 7-9 + Operations
    [
      { label: "7", value: "7", type: "number" as const, disabled: base < 8 },
      { label: "8", value: "8", type: "number" as const, disabled: base < 10 },
      { label: "9", value: "9", type: "number" as const, disabled: base < 10 },
      { label: "÷", value: "/", type: "operation" as const },
      { label: "×", value: "*", type: "operation" as const },
      { label: "⌫", value: "backspace", type: "special" as const, icon: true },
    ],
    // Row 4: Numbers 4-6 + Operations
    [
      { label: "4", value: "4", type: "number" as const, disabled: base < 8 },
      { label: "5", value: "5", type: "number" as const, disabled: base < 8 },
      { label: "6", value: "6", type: "number" as const, disabled: base < 8 },
      { label: "−", value: "-", type: "operation" as const },
      { label: "+", value: "+", type: "operation" as const },
      { label: "C", value: "clear", type: "special" as const },
    ],
    // Row 5: Numbers 1-3 + Operations
    [
      { label: "1", value: "1", type: "number" as const },
      { label: "2", value: "2", type: "number" as const, disabled: base < 8 },
      { label: "3", value: "3", type: "number" as const, disabled: base < 8 },
      { label: "(", value: "(", type: "special" as const },
      { label: ")", value: ")", type: "special" as const },
      { label: "=", value: "=", type: "operation" as const },
    ],
    // Row 6: Zero + Utility
    [
      { label: "0", value: "0", type: "number" as const },
      { label: "00", value: "00", type: "number" as const },
      { label: "mod", value: "%", type: "operation" as const },
      { label: "", value: "", type: "special" as const }, // Empty space
      { label: "", value: "", type: "special" as const }, // Empty space
    ],
  ];

  // Function to get button styling - only highlight clear and equals
  const getButtonStyle = (value: string) => {
    if (value === "clear") {
      return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    }
    if (value === "=") {
      return "bg-primary text-primary-foreground hover:bg-primary/90";
    }
    return "bg-background hover:bg-accent";
  };

  const handleButtonClick = (value: string, type: string) => {
    if (value === "clear") {
      onClear();
    } else {
      onButtonClick(
        value,
        type as "number" | "operation" | "function" | "special"
      );
    }
  };

  return (
    <div>
      <div className="grid grid-cols-6 gap-1">
        {buttonGrid.flat().map((button, index) => {
          // Skip empty buttons
          if (!button.label && !button.value) {
            return <div key={index} className="w-full"></div>;
          }

          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              disabled={button.disabled || false}
              className={`h-7 text-xs font-mono border-0 ${getButtonStyle(
                button.value
              )}`}
              onClick={() => handleButtonClick(button.value, button.type)}
            >
              {button.icon && button.value === "backspace" ? (
                <Delete className="h-3 w-3" />
              ) : (
                button.label
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
