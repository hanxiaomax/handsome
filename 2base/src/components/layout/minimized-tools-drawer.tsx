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
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, Clock } from "lucide-react";
import {
  useMinimizedToolsList,
  useMinimizedToolsActions,
} from "@/stores/minimized-tools-store";

interface MinimizedToolsDrawerProps {
  children: React.ReactNode;
}

export function MinimizedToolsDrawer({ children }: MinimizedToolsDrawerProps) {
  const navigate = useNavigate();
  const minimizedTools = useMinimizedToolsList();
  const { restoreTool, closeTool, clearAllMinimized } =
    useMinimizedToolsActions();
  const [isOpen, setIsOpen] = useState(false);

  const handleRestoreTool = (toolId: string, toolPath: string) => {
    restoreTool(toolId);
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

  const formatMinimizedTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return "Just now";
    }
  };

  if (minimizedTools.length === 0) {
    return <>{children}</>;
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="bottom">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[70vh] bg-background/95 backdrop-blur-sm border-t">
        {/* Drawer Header - 简约标题栏 */}
        <DrawerHeader className="pb-4 pt-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-3 text-base font-semibold">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ChevronDown className="h-4 w-4" />
                <Clock className="h-4 w-4" />
              </div>
              <span>Minimized Tools</span>
              <Badge variant="secondary" className="text-xs font-mono">
                {minimizedTools.length}
              </Badge>
            </DrawerTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs h-8 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="h-3 w-3 mr-1.5" />
              Clear All
            </Button>
          </div>
        </DrawerHeader>

        {/* Tools Grid - 使用tools页面的卡片样式 */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[50vh] overflow-y-auto">
            {minimizedTools.map((minimizedTool) => {
              const IconComponent = minimizedTool.toolInfo.icon;

              return (
                <div
                  key={minimizedTool.id}
                  className="group relative bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/20 cursor-pointer"
                  onClick={() =>
                    handleRestoreTool(
                      minimizedTool.id,
                      minimizedTool.toolInfo.path
                    )
                  }
                >
                  {/* Close Button - Top Right Corner */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={(e) => handleCloseTool(minimizedTool.id, e)}
                    title="Close Tool"
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Tool Icon - 使用与tools页面相同的样式 */}
                  <div className="mb-3">
                    <div className="p-3 bg-primary/10 rounded-lg w-fit">
                      {IconComponent && typeof IconComponent === "function" ? (
                        <IconComponent className="h-6 w-6 text-primary" />
                      ) : (
                        <div className="h-6 w-6 bg-muted rounded" />
                      )}
                    </div>
                  </div>

                  {/* Tool Info */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1 mb-1">
                      {minimizedTool.toolInfo.name}
                    </h3>
                    {minimizedTool.toolInfo.description && (
                      <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                        {minimizedTool.toolInfo.description}
                      </p>
                    )}
                  </div>

                  {/* Tool Footer - Category and Time */}
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-xs font-normal">
                      {minimizedTool.toolInfo.category}
                    </Badge>
                    <span className="text-muted-foreground font-mono">
                      {formatMinimizedTime(minimizedTool.minimizedAt)}
                    </span>
                  </div>

                  {/* State Indicator - 如果有保存的状态 */}
                  {minimizedTool.state && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
                        State Saved
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
