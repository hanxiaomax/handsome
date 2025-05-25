import { Card, CardContent } from "@/components/ui/card";
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
}

export function Display({ value, currentBase, bitWidth, error }: DisplayProps) {
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

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
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

        {/* Multi-base Display */}
        <div className="grid grid-cols-2 gap-2">
          {bases.map((base) => {
            const displayValue = getDisplayValue(base);
            const isActive = base === currentBase;

            return (
              <div
                key={base}
                className={`p-2 rounded border text-sm font-mono ${
                  isActive
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/30 border-border text-muted-foreground"
                }`}
              >
                <div className="text-xs font-normal mb-1">
                  {getBaseLabel(base)}
                </div>
                <div className="font-bold">
                  {truncateForDisplay(displayValue, 15)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
