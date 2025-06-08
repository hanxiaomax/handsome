import type { BitWidth } from "../types";

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
  // Render 64-bit grid with configurable bits per row
  const renderBitGrid = () => {
    const rows = [];
    const totalBits = 64;
    const numRows = Math.ceil(totalBits / bitsPerRow);

    // Create bit button
    const createBitButton = (bitIndex: number) => {
      const isSet = testBit(currentDecimal, bitIndex);
      const isDisabled = bitIndex >= bitWidth;

      return (
        <button
          key={bitIndex}
          disabled={isDisabled}
          className={`w-6 h-6 text-xs font-mono border-0 ${
            isDisabled
              ? "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
              : isSet
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-muted/80 text-foreground hover:bg-muted"
          }`}
          onClick={() => !isDisabled && onBitToggle(bitIndex)}
          title={
            isDisabled
              ? `Bit ${bitIndex}: disabled`
              : `Bit ${bitIndex}: ${isSet ? "1" : "0"}`
          }
        >
          {isSet ? "1" : "0"}
        </button>
      );
    };

    // Create labels for bit ranges
    const createLabels = (startBit: number, bitsInRow: number) => {
      const labels = [];
      const groupSize = 8; // Always group by 8 bits
      const numGroups = Math.ceil(bitsInRow / groupSize);

      for (let g = 0; g < numGroups; g++) {
        const groupStart = Math.max(
          0,
          startBit - g * groupSize - (groupSize - 1)
        );
        const groupEnd = Math.max(0, startBit - g * groupSize);
        labels.push(
          <div
            key={`label-${g}`}
            className="text-xs text-muted-foreground w-12 text-center"
          >
            {groupEnd}-{groupStart}
          </div>
        );
      }

      return labels;
    };

    // Create bit groups with spacing
    const createBitGroups = (bits: React.ReactNode[]) => {
      const groups = [];
      const groupSize = 8;

      for (let i = 0; i < bits.length; i += groupSize) {
        const group = bits.slice(i, i + groupSize);
        groups.push(
          <div key={`group-${i}`} className="flex gap-0.5">
            {group}
          </div>
        );

        // Add spacer between groups (except for the last group)
        if (i + groupSize < bits.length) {
          groups.push(<div key={`spacer-${i}`} className="w-1"></div>);
        }
      }

      return groups;
    };

    // Generate rows from highest bit to lowest
    for (let row = 0; row < numRows; row++) {
      const startBit = totalBits - 1 - row * bitsPerRow;
      const endBit = Math.max(0, startBit - bitsPerRow + 1);
      const actualBitsInRow = startBit - endBit + 1;

      // Create bits for this row (from high to low)
      const rowBits = [];
      for (let bit = startBit; bit >= endBit; bit--) {
        rowBits.push(createBitButton(bit));
      }

      // Create labels above bits
      const labels = createLabels(startBit, actualBitsInRow);

      rows.push(
        <div key={`row-${row}`} className="space-y-1">
          {/* Labels above bits */}
          <div className="flex gap-1 justify-start">{labels}</div>
          {/* Bit buttons with grouping */}
          <div className="flex gap-1">{createBitGroups(rowBits)}</div>
        </div>
      );
    }

    return rows;
  };

  return (
    <div className="border rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {bitWidth}-bit active • Click to toggle
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Set: {activeBits}</span>
          <span>Clear: {clearBits}</span>
          <span>Unused: {unusedBits}</span>
        </div>
      </div>
      <div className="space-y-2">{renderBitGrid()}</div>
    </div>
  );
}
