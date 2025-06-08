import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { BitWidth } from "../types";

interface ControlBarProps {
  bitWidth: BitWidth;
  onBitWidthChange: (width: BitWidth) => void;
}

export function ControlBar({ bitWidth, onBitWidthChange }: ControlBarProps) {
  return (
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
  );
}
