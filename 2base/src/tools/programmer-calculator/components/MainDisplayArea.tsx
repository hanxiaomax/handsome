import type { Base } from "../types";
import { toast } from "sonner";

interface MainDisplayAreaProps {
  currentValue: string;
  expression: string;
  base: Base;
  bitWidth: number;
  error: boolean;
  convertAndDisplay: (value: string, fromBase: Base, toBase: Base) => string;
}

export function MainDisplayArea({
  currentValue,
  expression,
  base,
  bitWidth,
  error,
  convertAndDisplay,
}: MainDisplayAreaProps) {
  const copyToClipboard = async (value: string, format: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Copied ${format} value: ${value}`);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  };
  const currentBaseString =
    base === 2 ? "BIN" : base === 8 ? "OCT" : base === 10 ? "DEC" : "HEX";

  return (
    <div className="bg-muted/20 p-4 space-y-3">
      {/* Header - Current Base and Bit Width */}
      <div className="text-right">
        <span className="text-xs text-muted-foreground font-medium">
          {currentBaseString} ({bitWidth}-bit)
        </span>
      </div>

      {/* Main Value Display - 显示当前值 */}
      <div className="text-right">
        <div className="text-2xl p-2 border-2 font-mono font-bold min-h-[2.5rem] flex items-center justify-end">
          {error ? (
            <span className="text-destructive">Error</span>
          ) : (
            <span>{expression || currentValue || "0"}</span>
          )}
        </div>
      </div>

      {/* Multi-Base Display Grid */}
      <div>
        <button
          onClick={() =>
            copyToClipboard(convertAndDisplay(currentValue, base, 16), "HEX")
          }
          className={`w-full p-3 rounded  text-left flex justify-between items-center transition-colors hover:bg-muted/50 ${
            base === 16 ? "bg-accent/60 " : ""
          }`}
          title="Click to copy HEX value"
        >
          <span className="text-sm font-medium text-muted-foreground">HEX</span>
          <span className="font-mono text-sm">
            {convertAndDisplay(currentValue, base, 16)}
          </span>
        </button>

        <button
          onClick={() =>
            copyToClipboard(convertAndDisplay(currentValue, base, 10), "DEC")
          }
          className={`w-full p-3 rounded  text-left flex justify-between items-center transition-colors hover:bg-muted/50 ${
            base === 10 ? "bg-accent/60 " : ""
          }`}
          title="Click to copy DEC value"
        >
          <span className="text-sm font-medium text-muted-foreground">DEC</span>
          <span className="font-mono text-sm">
            {convertAndDisplay(currentValue, base, 10)}
          </span>
        </button>

        <button
          onClick={() =>
            copyToClipboard(convertAndDisplay(currentValue, base, 8), "OCT")
          }
          className={`w-full p-3 rounded  text-left flex justify-between items-center transition-colors hover:bg-muted/50 ${
            base === 8 ? "bg-accent/60 " : ""
          }`}
          title="Click to copy OCT value"
        >
          <span className="text-sm font-medium text-muted-foreground">OCT</span>
          <span className="font-mono text-sm">
            {convertAndDisplay(currentValue, base, 8)}
          </span>
        </button>

        <button
          onClick={() =>
            copyToClipboard(convertAndDisplay(currentValue, base, 2), "BIN")
          }
          className={`w-full p-3 rounded  text-left flex justify-between items-center transition-colors hover:bg-muted/50 ${
            base === 2 ? "bg-accent/60 " : ""
          }`}
          title="Click to copy BIN value"
        >
          <span className="text-sm font-medium text-muted-foreground">BIN</span>
          <span className="font-mono text-sm truncate">
            {convertAndDisplay(currentValue, base, 2)}
          </span>
        </button>
      </div>
    </div>
  );
}
