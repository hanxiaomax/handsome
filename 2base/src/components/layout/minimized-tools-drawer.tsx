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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { useMinimizedTools } from "@/contexts/minimized-tools-context";
import { getToolVersionInfo } from "@/lib/tool-utils";

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
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2">
              <Minimize2 className="h-5 w-5" />
              Minimized Tools ({minimizedTools.length})
            </DrawerTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Close All
              </Button>
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {minimizedTools.map((minimizedTool) => {
              const versionInfo = getToolVersionInfo(minimizedTool.toolInfo);
              const timeSinceMinimized = Math.floor(
                (Date.now() - minimizedTool.minimizedAt) / 1000 / 60
              );

              return (
                <Card
                  key={minimizedTool.id}
                  className="cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() =>
                    handleRestoreTool(
                      minimizedTool.id,
                      minimizedTool.toolInfo.path
                    )
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <minimizedTool.toolInfo.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">
                            {minimizedTool.toolInfo.name}
                          </h3>
                          {versionInfo.isNew && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1 py-0 h-4 bg-green-100 text-green-700 border-green-200 font-medium"
                            >
                              NEW
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {minimizedTool.toolInfo.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Minimized {timeSinceMinimized}m ago
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-primary hover:text-primary-foreground"
                              title="Restore Tool"
                            >
                              <Maximize2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={(e) =>
                                handleCloseTool(minimizedTool.id, e)
                              }
                              title="Close Tool"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
