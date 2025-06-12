import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMinimizedToolsList } from "@/stores/minimized-tools-store";
import { MinimizedToolsDrawer } from "./minimized-tools-drawer";

export function MinimizedToolsIndicator() {
  const minimizedTools = useMinimizedToolsList();

  if (minimizedTools.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <MinimizedToolsDrawer>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 px-3 bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl hover:bg-background/90 transition-all duration-200 rounded-full text-xs font-medium"
          title={`${minimizedTools.length} minimized tool${
            minimizedTools.length !== 1 ? "s" : ""
          }`}
        >
          <ChevronUp className="h-3 w-3 mr-1.5" />
          <span className="tabular-nums font-mono">
            {minimizedTools.length}
          </span>
        </Button>
      </MinimizedToolsDrawer>
    </div>
  );
}
