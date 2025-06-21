import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { BitWidth, Base } from "../types";

interface ControlBarProps {
  bitWidth: BitWidth;
  base: Base;
  onBitWidthChange: (width: BitWidth) => void;
  onBaseChange: (base: Base) => void;
}

export function ControlBar({
  bitWidth,
  base,
  onBitWidthChange,
  onBaseChange,
}: ControlBarProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Bit Width Selection */}
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          value={bitWidth.toString()}
          onValueChange={(value) => {
            if (value) onBitWidthChange(parseInt(value) as BitWidth);
          }}
          size="sm"
        >
          <ToggleGroupItem value="8" className="h-8 px-2 text-xs">
            8
          </ToggleGroupItem>
          <ToggleGroupItem value="16" className="h-8 px-2 text-xs">
            16
          </ToggleGroupItem>
          <ToggleGroupItem value="32" className="h-8 px-2 text-xs">
            32
          </ToggleGroupItem>
          <ToggleGroupItem value="64" className="h-8 px-2 text-xs">
            64
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Base Selection */}
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          value={base.toString()}
          onValueChange={(value) => {
            if (value) onBaseChange(parseInt(value) as Base);
          }}
          size="sm"
        >
          <ToggleGroupItem value="2" className="h-8 px-2 text-xs">
            BIN
          </ToggleGroupItem>
          <ToggleGroupItem value="8" className="h-8 px-2 text-xs">
            OCT
          </ToggleGroupItem>
          <ToggleGroupItem value="10" className="h-8 px-2 text-xs">
            DEC
          </ToggleGroupItem>
          <ToggleGroupItem value="16" className="h-8 px-2 text-xs">
            HEX
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
