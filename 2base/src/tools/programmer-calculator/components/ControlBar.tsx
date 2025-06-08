import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { BitWidth } from "../types";

interface ControlBarProps {
  bitWidth: BitWidth;
  onBitWidthChange: (width: BitWidth) => void;
  onButtonClick: (value: string, type: string) => void;
}

export function ControlBar({
  bitWidth,
  onBitWidthChange,
  onButtonClick,
}: ControlBarProps) {
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

      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => onButtonClick("clear", "special")}
      >
        Clear
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => onButtonClick("~", "operation")}
      >
        NOT
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => onButtonClick("<<", "operation")}
      >
        LSL
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => onButtonClick(">>", "operation")}
      >
        LSR
      </Button>
    </div>
  );
}
