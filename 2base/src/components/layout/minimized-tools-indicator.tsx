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
          className="group h-8 px-3 bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 ease-out rounded-full text-xs font-medium hover:bg-destructive hover:border-destructive hover:text-destructive-foreground hover:scale-x-110 hover:px-4 transform-gpu"
          title={`${minimizedTools.length} minimized tool${
            minimizedTools.length !== 1 ? "s" : ""
          }`}
        >
          <ChevronUp className="h-3 w-3 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
          <span className="tabular-nums font-mono transition-all duration-300">
            {minimizedTools.length}
          </span>
          <span className="ml-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-20">
            minimized
          </span>
        </Button>
      </MinimizedToolsDrawer>
    </div>
  );
}
