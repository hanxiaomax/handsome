import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      const isSet = testBit(decimal, i);
      const bitValue = binaryString[bitWidth - 1 - i];

      bits.push(
        <Button
          key={i}
          variant={isSet ? "default" : "outline"}
          size="sm"
          className={`w-8 h-8 p-0 font-mono text-xs ${
            isSet ? "bg-primary text-primary-foreground" : "bg-background"
          }`}
          onClick={() => handleBitToggle(i)}
          title={`Bit ${i}: ${bitValue} (Click to toggle)`}
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

    for (let i = bitWidth - bitsPerGroup; i >= 0; i -= bitsPerGroup) {
      const endBit = Math.min(i + bitsPerGroup - 1, bitWidth - 1);
      const startBit = i;

      groups.push(
        <div key={`group-${i}`} className="flex gap-1">
          <div className="text-xs text-muted-foreground self-center mr-2 min-w-[3rem]">
            {endBit}-{startBit}
          </div>
          <div className="flex gap-1">{renderBitGroup(startBit, endBit)}</div>
        </div>
      );
    }

    return groups;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          Bit Visualization ({bitWidth}-bit)
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Click any bit to toggle its value
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {renderBitGroups()}

        {/* Bit Information */}
        <div className="mt-4 pt-3 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Set bits:</span>{" "}
              <span className="font-mono">
                {binaryString.split("").filter((bit) => bit === "1").length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Clear bits:</span>{" "}
              <span className="font-mono">
                {binaryString.split("").filter((bit) => bit === "0").length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
