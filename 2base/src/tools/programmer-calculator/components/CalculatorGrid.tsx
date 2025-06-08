import { Button } from "@/components/ui/button";
import type { Base } from "../types";

interface CalculatorButton {
  label: string;
  value: string;
  type: "number" | "operation" | "function" | "special";
  disabled?: boolean;
}

interface CalculatorGridProps {
  base: Base;
  onButtonClick: (
    value: string,
    type: "number" | "operation" | "function" | "special"
  ) => void;
}

export function CalculatorGrid({ base, onButtonClick }: CalculatorGridProps) {
  // Calculator button grid
  const buttonGrid: CalculatorButton[][] = [
    // Row 1
    [
      { label: "(", value: "(", type: "special" as const },
      { label: ")", value: ")", type: "special" as const },
      { label: "XOR", value: "^", type: "operation" as const },
      { label: "D", value: "D", type: "number" as const, disabled: base < 16 },
      { label: "E", value: "E", type: "number" as const, disabled: base < 16 },
      { label: "F", value: "F", type: "number" as const, disabled: base < 16 },
      { label: "⌫", value: "backspace", type: "special" as const },
    ],
    // Row 2
    [
      { label: "AND", value: "&", type: "operation" as const },
      { label: "OR", value: "|", type: "operation" as const },
      { label: "NOR", value: "nor", type: "function" as const },
      { label: "A", value: "A", type: "number" as const, disabled: base < 16 },
      { label: "B", value: "B", type: "number" as const, disabled: base < 16 },
      { label: "C", value: "C", type: "number" as const, disabled: base < 16 },
      { label: "÷", value: "/", type: "operation" as const },
    ],
    // Row 3
    [
      { label: "NOT", value: "~", type: "operation" as const },
      { label: "<<", value: "<<", type: "operation" as const },
      { label: ">>", value: ">>", type: "operation" as const },
      { label: "7", value: "7", type: "number" as const, disabled: base < 8 },
      { label: "8", value: "8", type: "number" as const, disabled: base < 10 },
      { label: "9", value: "9", type: "number" as const, disabled: base < 10 },
      { label: "×", value: "*", type: "operation" as const },
    ],
    // Row 4
    [
      { label: "NEG", value: "negate", type: "function" as const },
      { label: "X<<Y", value: "lsl", type: "function" as const },
      { label: "X>>Y", value: "lsr", type: "function" as const },
      { label: "4", value: "4", type: "number" as const, disabled: base < 8 },
      { label: "5", value: "5", type: "number" as const, disabled: base < 8 },
      { label: "6", value: "6", type: "number" as const, disabled: base < 8 },
      { label: "−", value: "-", type: "operation" as const },
    ],
    // Row 5
    [
      { label: "mod", value: "%", type: "operation" as const },
      { label: "RoL", value: "rol", type: "function" as const },
      { label: "RoR", value: "ror", type: "function" as const },
      { label: "1", value: "1", type: "number" as const },
      { label: "2", value: "2", type: "number" as const, disabled: base < 8 },
      { label: "3", value: "3", type: "number" as const, disabled: base < 8 },
      { label: "+", value: "+", type: "operation" as const },
    ],
    // Row 6
    [
      { label: "📋", value: "copy", type: "special" as const },
      { label: "flip₂", value: "flip2", type: "function" as const },
      { label: "flip₁₆", value: "flip16", type: "function" as const },
      { label: "FF", value: "ff", type: "special" as const },
      { label: "0", value: "0", type: "number" as const },
      { label: "00", value: "00", type: "number" as const },
      { label: "=", value: "=", type: "operation" as const },
    ],
  ];

  return (
    <div className="border rounded-lg p-2">
      <div className="grid grid-cols-7 gap-1">
        {buttonGrid.flat().map((button, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            disabled={button.disabled || false}
            className="h-8 text-xs font-mono"
            onClick={() => onButtonClick(button.value, button.type)}
          >
            {button.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
