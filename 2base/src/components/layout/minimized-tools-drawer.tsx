import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";
import { useMinimizedTools } from "@/contexts/minimized-tools-context";

interface MinimizedToolsDrawerProps {
  children: React.ReactNode;
}

export function MinimizedToolsDrawer({ children }: MinimizedToolsDrawerProps) {
  const navigate = useNavigate();
  const { minimizedTools, closeTool, clearAllMinimized } = useMinimizedTools();
  const [isOpen, setIsOpen] = useState(false);

  const handleRestoreTool = (_toolId: string, toolPath: string) => {
    setIsOpen(false);
    navigate(toolPath);
  };

  const handleCloseTool = (toolId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    closeTool(toolId);
  };

  const handleClearAll = () => {
    clearAllMinimized();
    setIsOpen(false);
  };

  if (minimizedTools.length === 0) {
    return <>{children}</>;
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="bottom">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[60vh]">
        <DrawerHeader className="pb-3 pt-3">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2 text-sm font-medium">
              <ChevronDown className="h-4 w-4" />
              <span className="tabular-nums font-mono">
                {minimizedTools.length}
              </span>
              <span>
                minimized tool{minimizedTools.length !== 1 ? "s" : ""}
              </span>
            </DrawerTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs h-7 px-2 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-[45vh] overflow-y-auto">
            {minimizedTools.map((minimizedTool) => (
              <div
                key={minimizedTool.id}
                className="flex items-center gap-2 p-2 bg-background border border-border/50 rounded-md hover:bg-accent/50 cursor-pointer transition-colors group"
                onClick={() =>
                  handleRestoreTool(
                    minimizedTool.id,
                    minimizedTool.toolInfo.path
                  )
                }
              >
                {/* Tool Name */}
                <span className="flex-1 text-sm font-medium truncate">
                  {minimizedTool.toolInfo.name}
                </span>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
                  onClick={(e) => handleCloseTool(minimizedTool.id, e)}
                  title="Close Tool"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
