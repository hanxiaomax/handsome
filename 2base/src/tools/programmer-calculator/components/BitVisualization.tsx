import type { BitWidth } from "../types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BitVisualizationProps {
  currentDecimal: number;
  bitWidth: BitWidth;
  activeBits: number;
  clearBits: number;
  unusedBits: number;
  bitsPerRow: 8 | 16 | 32;
  onBitToggle: (position: number) => void;
  testBit: (value: number, position: number) => boolean;
}

export function BitVisualization({
  currentDecimal,
  bitWidth,
  activeBits,
  clearBits,
  unusedBits,
  bitsPerRow,
  onBitToggle,
  testBit,
}: BitVisualizationProps) {
  // Render bit grid from highest to lowest bit
  const renderBitGrid = () => {
    const totalBits = 64;
    const numRows = Math.ceil(totalBits / bitsPerRow);
    const rows = [];

    // Helper function to create a single bit button
    const createBitButton = (bitPosition: number) => {
      const isSet = testBit(currentDecimal, bitPosition);
      const isDisabled = bitPosition >= bitWidth;

      return (
        <div
          key={`bit-${bitPosition}`}
          className="flex flex-col items-center gap-0.5"
        >
          {/* Bit position label */}
          <div className="text-xs text-muted-foreground font-mono w-5 text-center leading-none">
            {bitPosition}
          </div>

          {/* Bit button */}
          <Button
            variant={isSet ? "default" : "outline"}
            size="sm"
            disabled={isDisabled}
            className={cn(
              "w-5 h-5 text-xs font-mono p-0 min-w-0 leading-none",
              isDisabled && "opacity-30 cursor-not-allowed",
              isSet &&
                !isDisabled &&
                "bg-primary text-primary-foreground hover:bg-primary/90",
              !isSet &&
                !isDisabled &&
                "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => !isDisabled && onBitToggle(bitPosition)}
            title={`Bit ${bitPosition}: ${isSet ? "1" : "0"}${
              isDisabled ? " (disabled)" : ""
            }`}
          >
            {isSet ? "1" : "0"}
          </Button>
        </div>
      );
    };

    // Helper function to create 8-bit groups with spacing
    const createBitGroup = (startBit: number, count: number) => {
      const bits = [];
      for (let i = 0; i < count; i++) {
        const bitPos = startBit - i;
        if (bitPos >= 0) {
          bits.push(createBitButton(bitPos));
        }
      }
      return (
        <div key={`group-${startBit}`} className="flex gap-px">
          {bits}
        </div>
      );
    };

    // Generate rows: each row shows bitsPerRow bits
    for (let row = 0; row < numRows; row++) {
      const highestBitInRow = totalBits - 1 - row * bitsPerRow;
      const lowestBitInRow = Math.max(0, highestBitInRow - bitsPerRow + 1);

      const groups = [];
      const groupSize = 8;

      // Create 8-bit groups within this row
      for (
        let groupStart = highestBitInRow;
        groupStart >= lowestBitInRow;
        groupStart -= groupSize
      ) {
        const actualGroupSize = Math.min(
          groupSize,
          groupStart - lowestBitInRow + 1
        );
        groups.push(createBitGroup(groupStart, actualGroupSize));

        // Add spacer between groups (but not after the last group)
        if (groupStart - groupSize >= lowestBitInRow) {
          groups.push(
            <div key={`spacer-${groupStart}`} className="w-1.5"></div>
          );
        }
      }

      rows.push(
        <div key={`row-${row}`} className="mb-2">
          <div className="flex gap-1 justify-start">{groups}</div>
        </div>
      );
    }

    return rows;
  };

  return (
    <div className="space-y-2">
      {/* Header with bit statistics */}
      <div className="flex items-center justify-between py-1">
        <div className="text-sm text-muted-foreground">
          {bitWidth}-bit active • Click to toggle
        </div>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>Set: {activeBits}</span>
          <span>Clear: {clearBits}</span>
          <span>Unused: {unusedBits}</span>
        </div>
      </div>

      {/* Bit grid */}
      <div className="space-y-1">{renderBitGrid()}</div>
    </div>
  );
}
