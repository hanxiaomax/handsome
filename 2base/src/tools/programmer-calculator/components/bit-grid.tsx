import { Button } from "@/components/ui/button";
import type { BitWidth } from "../types";
import { parseValue, toBinaryWithWidth } from "../lib/base-converter";
import { toggleBit, testBit } from "../lib/bitwise";

interface BitGridProps {
  value: string;
  base: number;
  bitWidth: BitWidth;
  onValueChange: (newValue: string) => void;
}

export function BitGrid({
  value,
  base,
  bitWidth,
  onValueChange,
}: BitGridProps) {
  const decimal = parseValue(value || "0", base as 2 | 8 | 10 | 16);
  const binaryString = toBinaryWithWidth(decimal, bitWidth);

  const handleBitToggle = (position: number) => {
    // Only allow toggling bits within the current bit width
    if (position >= bitWidth) return;

    try {
      const newDecimal = toggleBit(decimal, position);
      const newValue = newDecimal.toString(base).toUpperCase();
      onValueChange(newValue);
    } catch (error) {
      console.error("Error toggling bit:", error);
    }
  };

  const renderBitGroup = (startBit: number, endBit: number) => {
    const bits = [];
    for (let i = endBit; i >= startBit; i--) {
      const isWithinBitWidth = i < bitWidth;
      const isSet = isWithinBitWidth ? testBit(decimal, i) : false;
      const bitValue = isWithinBitWidth
        ? binaryString[bitWidth - 1 - i] || "0"
        : "0";

      bits.push(
        <Button
          key={i}
          variant={isSet ? "default" : "outline"}
          size="sm"
          disabled={!isWithinBitWidth}
          className={`w-6 h-6 p-0 font-mono text-xs ${
            !isWithinBitWidth
              ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
              : isSet
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
          onClick={() => handleBitToggle(i)}
          title={
            !isWithinBitWidth
              ? `Bit ${i}: unused (beyond ${bitWidth}-bit limit)`
              : `Bit ${i}: ${bitValue} (Click to toggle)`
          }
        >
          {bitValue}
        </Button>
      );
    }
    return bits;
  };

  const renderBitGroups = () => {
    const groups = [];
    const bitsPerGroup = 8;
    const totalBits = 64; // Fixed 64-bit display

    for (let i = totalBits - bitsPerGroup; i >= 0; i -= bitsPerGroup) {
      const endBit = Math.min(i + bitsPerGroup - 1, totalBits - 1);
      const startBit = i;

      groups.push(
        <div key={`group-${i}`} className="flex gap-1 items-center">
          <div className="text-xs text-muted-foreground self-center mr-1 min-w-[2.5rem] text-right">
            {endBit}-{startBit}
          </div>
          <div className="flex gap-0.5">{renderBitGroup(startBit, endBit)}</div>
        </div>
      );
    }

    return groups;
  };

  const activeBits = binaryString.split("").filter((bit) => bit === "1").length;
  const totalActiveBits = bitWidth;

  return (
    <div className="w-full space-y-1">
      <div className="text-xs text-muted-foreground mb-1">
        {bitWidth}-bit active • Click to toggle
      </div>

      <div className="space-y-0.5">{renderBitGroups()}</div>

      {/* Compact Bit Information */}
      <div className="pt-2 border-t">
        <div className="flex justify-between text-xs">
          <span>
            <span className="text-muted-foreground">Set:</span>{" "}
            <span className="font-mono">{activeBits}</span>
          </span>
          <span>
            <span className="text-muted-foreground">Clear:</span>{" "}
            <span className="font-mono">{totalActiveBits - activeBits}</span>
          </span>
          <span>
            <span className="text-muted-foreground">Unused:</span>{" "}
            <span className="font-mono text-muted-foreground">
              {64 - bitWidth}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
