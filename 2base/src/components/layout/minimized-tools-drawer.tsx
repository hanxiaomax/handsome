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

        {/* Tools Grid - 简约卡片网格 */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto">
            {minimizedTools.map((minimizedTool) => {
              const IconComponent = minimizedTool.toolInfo.icon;

              return (
                <Card
                  key={minimizedTool.id}
                  className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-border/50 hover:border-border bg-card/50 hover:bg-card"
                  onClick={() =>
                    handleRestoreTool(
                      minimizedTool.id,
                      minimizedTool.toolInfo.path
                    )
                  }
                >
                  <CardContent className="p-4">
                    {/* Tool Header - 图标和关闭按钮 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {IconComponent &&
                        typeof IconComponent === "function" ? (
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                            <IconComponent className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                            <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                        onClick={(e) => handleCloseTool(minimizedTool.id, e)}
                        title="Close Tool"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Tool Info - 名称和描述 */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm leading-tight truncate">
                        {minimizedTool.toolInfo.name}
                      </h3>

                      {minimizedTool.toolInfo.description && (
                        <p
                          className="text-xs text-muted-foreground leading-relaxed overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {minimizedTool.toolInfo.description}
                        </p>
                      )}
                    </div>

                    {/* Tool Footer - 时间和状态 */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                      <Badge variant="outline" className="text-xs font-normal">
                        {minimizedTool.toolInfo.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
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
