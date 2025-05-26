import { Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMinimizedTools } from "@/contexts/minimized-tools-context";
import { MinimizedToolsDrawer } from "./minimized-tools-drawer";

export function MinimizedToolsIndicator() {
  const { minimizedTools } = useMinimizedTools();

  if (minimizedTools.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <MinimizedToolsDrawer>
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow relative"
          title={`${minimizedTools.length} minimized tool${
            minimizedTools.length !== 1 ? "s" : ""
          }`}
        >
          <Minimize2 className="h-5 w-5 mr-2" />
          Minimized Tools
          <Badge
            variant="secondary"
            className="ml-2 bg-background text-foreground border"
          >
            {minimizedTools.length}
          </Badge>
        </Button>
      </MinimizedToolsDrawer>
    </div>
  );
}
