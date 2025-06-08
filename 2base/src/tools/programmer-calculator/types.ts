export type Base = 2 | 8 | 10 | 16;
export type BitWidth = 8 | 16 | 32 | 64;
export type CalculatorMode = "programmer" | "scientific";
export type AngleUnit = "deg" | "rad";
export type Operation =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "&"
  | "|"
  | "^"
  | "<<"
  | ">>"
  | "~"
  | "="
  | null;

export interface CalculationEntry {
  expression: string;
  result: string;
  timestamp: Date;
  base: Base;
}

export interface CalculatorState {
  currentValue: string;
  previousValue: string;
  operation: Operation;
  expression: string;
  base: Base;
  bitWidth: BitWidth;
  mode: CalculatorMode;
  angleUnit: AngleUnit;
  memory: number;
  history: CalculationEntry[];
  isNewNumber: boolean;
  error: string | null;
}

export interface ButtonConfig {
  label: string;
  value: string;
  type: "number" | "operation" | "function" | "special";
  className?: string;
  disabled?: boolean;
}
