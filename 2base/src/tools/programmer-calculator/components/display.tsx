import type { Base, BitWidth } from "../types";
import { formatForBase, parseValue } from "../lib/base-converter";
import {
  formatDisplayValue,
  getBaseLabel,
  truncateForDisplay,
} from "../lib/formatter";

interface DisplayProps {
  value: string;
  currentBase: Base;
  bitWidth: BitWidth;
  error?: string | null;
  onBaseChange?: (base: Base) => void;
}

export function Display({
  value,
  currentBase,
  bitWidth,
  error,
  onBaseChange,
}: DisplayProps) {
  const bases: Base[] = [16, 10, 8, 2];

  const getDisplayValue = (targetBase: Base): string => {
    if (error) return "Error";
    if (!value || value === "0") return "0";

    try {
      const decimal = parseValue(value, currentBase);
      const converted = formatForBase(decimal.toString(), targetBase);
      return formatDisplayValue(converted, targetBase);
    } catch {
      return "Error";
    }
  };

  const handleBaseClick = (base: Base) => {
    if (onBaseChange && base !== currentBase) {
      onBaseChange(base);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Display */}
      <div className="text-right">
        <div className="text-sm text-muted-foreground mb-1">
          {getBaseLabel(currentBase)} ({bitWidth}-bit)
        </div>
        <div className="text-2xl font-mono font-bold min-h-[2rem] bg-muted/30 rounded px-3 py-2 border">
          {error ? (
            <span className="text-destructive">Error</span>
          ) : (
            <span className="text-foreground">
              {truncateForDisplay(formatDisplayValue(value, currentBase), 25)}
            </span>
          )}
        </div>
      </div>

      {/* Multi-base Display - Vertical Layout, Each Base on One Line */}
      <div className="space-y-2">
        {bases.map((base) => {
          const displayValue = getDisplayValue(base);
          const isActive = base === currentBase;

          return (
            <div
              key={base}
              className={`flex items-center justify-between py-2 px-3 rounded cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
              onClick={() => handleBaseClick(base)}
              title={`Switch to ${getBaseLabel(base)} (Base ${base})`}
            >
              <div className="text-xs font-medium opacity-70">
                {getBaseLabel(base)}
              </div>
              <div
                className={`font-mono text-sm font-semibold break-all text-right ${
                  isActive ? "text-primary" : "text-foreground"
                }`}
              >
                {displayValue}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
