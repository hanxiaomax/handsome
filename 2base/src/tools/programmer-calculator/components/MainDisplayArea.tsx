import type { Base } from "../types";

interface MainDisplayAreaProps {
  currentValue: string;
  base: Base;
  bitWidth: number;
  error: boolean;
  onBaseSelect: (base: Base) => void;
  convertAndDisplay: (value: string, fromBase: Base, toBase: Base) => string;
}

export function MainDisplayArea({
  currentValue,
  base,
  bitWidth,
  error,
  onBaseSelect,
  convertAndDisplay,
}: MainDisplayAreaProps) {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      {/* Main Value Display */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {base === 2
            ? "BIN"
            : base === 8
            ? "OCT"
            : base === 10
            ? "DEC"
            : "HEX"}{" "}
          ({bitWidth}-bit)
        </span>
        <div className="text-2xl font-mono font-bold">
          {error ? (
            <span className="text-destructive">Error</span>
          ) : (
            <span>{currentValue || "0"}</span>
          )}
        </div>
      </div>

      {/* Multi-Base Display Grid */}
      <div className="space-y-1">
        <button
          onClick={() => onBaseSelect(16)}
          className={`w-full p-2 rounded border text-left flex justify-between items-center transition-colors ${
            base === 16
              ? "bg-accent border-accent-foreground"
              : "hover:bg-muted"
          }`}
        >
          <span className="text-xs text-muted-foreground">HEX</span>
          <span className="font-mono text-sm">
            {convertAndDisplay(currentValue, base, 16)}
          </span>
        </button>

        <button
          onClick={() => onBaseSelect(10)}
          className={`w-full p-2 rounded border text-left flex justify-between items-center transition-colors ${
            base === 10
              ? "bg-accent border-accent-foreground"
              : "hover:bg-muted"
          }`}
        >
          <span className="text-xs text-muted-foreground">DEC</span>
          <span className="font-mono text-sm">
            {convertAndDisplay(currentValue, base, 10)}
          </span>
        </button>

        <button
          onClick={() => onBaseSelect(8)}
          className={`w-full p-2 rounded border text-left flex justify-between items-center transition-colors ${
            base === 8 ? "bg-accent border-accent-foreground" : "hover:bg-muted"
          }`}
        >
          <span className="text-xs text-muted-foreground">OCT</span>
          <span className="font-mono text-sm">
            {convertAndDisplay(currentValue, base, 8)}
          </span>
        </button>

        <button
          onClick={() => onBaseSelect(2)}
          className={`w-full p-2 rounded border text-left flex justify-between items-center transition-colors ${
            base === 2 ? "bg-accent border-accent-foreground" : "hover:bg-muted"
          }`}
        >
          <span className="text-xs text-muted-foreground">BIN</span>
          <span className="font-mono text-sm truncate">
            {convertAndDisplay(currentValue, base, 2)}
          </span>
        </button>
      </div>
    </div>
  );
}
