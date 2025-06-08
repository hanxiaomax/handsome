import type { Base, BitWidth } from "../types";

interface StatusBarProps {
  base: Base;
  bitWidth: BitWidth;
}

export function StatusBar({ base, bitWidth }: StatusBarProps) {
  return (
    <div className="flex justify-between items-center text-xs text-muted-foreground">
      <div>Mode: Programmer</div>
      <div>Base: {base}</div>
      <div>Width: {bitWidth}-bit</div>
    </div>
  );
}
