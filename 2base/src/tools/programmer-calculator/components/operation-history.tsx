// Card components removed for cleaner design
import type { CalculationEntry } from "../types";

interface OperationHistoryProps {
  history: CalculationEntry[];
}

export function OperationHistory({ history }: OperationHistoryProps) {
  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-medium">Operation History</h3>
      <div className="h-64 bg-muted/20 rounded border-2 border-dashed border-muted flex items-center justify-center">
        <span className="text-muted-foreground">
          Operation History - Coming Soon
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Track and replay calculation history - Currently {history.length}{" "}
        entries
      </p>
    </div>
  );
}
