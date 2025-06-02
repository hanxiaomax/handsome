import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { GlobalSearch } from "@/components/navigation/global-search";
import { useNavigate } from "react-router-dom";
import { Minus, Home, Heart } from "lucide-react";

interface ToolLayoutProps {
  toolName: string;
  toolDescription?: string;
  children: React.ReactNode;
  onMinimize?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

interface WindowControlsProps {
  onMinimize?: () => void;
  onNavigateHome?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

function WindowControls({
  onMinimize,
  onNavigateHome,
  onToggleFavorite,
  isFavorite = false,
}: WindowControlsProps) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur">
      <div className="flex items-center gap-2"></div>
      <div className="flex items-center gap-2">
        {/* Home Button */}
        {onNavigateHome && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateHome}
            className="h-8 px-3 gap-2"
            title="Go to Home"
          >
            <Home className="h-4 w-4" />
            <span className="text-xs">Home</span>
          </Button>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFavorite}
          className="h-8 px-3 gap-2"
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          disabled={!onToggleFavorite}
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? "fill-red-500 text-red-500" : ""
            }`}
          />
          <span className="text-xs">
            {isFavorite ? "Favorited" : "Favorite"}
          </span>
        </Button>

        {/* Minimize Button */}
        {onMinimize && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="h-8 px-3 gap-2"
            title="Minimize to Drawer"
          >
            <Minus className="h-4 w-4" />
            <span className="text-xs">Minimize</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export function ToolLayout({
  toolName,
  toolDescription,
  children,
  onMinimize,
  onToggleFavorite,
  isFavorite = false,
}: ToolLayoutProps) {
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    navigate("/");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div
        className="flex h-screen w-full"
        style={
          {
            "--sidebar-width": "20rem",
          } as React.CSSProperties
        }
      >
        {/* Sidebar Area - App Navigation */}
        <AppSidebar selectedTool={null} onNavigateHome={handleNavigateHome} />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header Area - Tool Information */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{toolName}</h2>
                {toolDescription && (
                  <p className="text-sm text-muted-foreground">
                    {toolDescription}
                  </p>
                )}
              </div>
              {/* Global Search - 全局搜索框 */}
              <div className="hidden sm:block">
                <GlobalSearch />
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Main Content Area - Tool Implementation */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Window Controls Bar - Full Width */}
            <WindowControls
              onMinimize={onMinimize}
              onNavigateHome={handleNavigateHome}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite}
            />

            {/* Tool Content - Below Controls */}
            <div className="flex-1 overflow-auto bg-muted/30">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
