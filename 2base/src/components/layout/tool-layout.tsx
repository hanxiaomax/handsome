import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { GlobalSearch } from "@/components/navigation/global-search";
import { MinimizedToolsIndicator } from "@/components/layout/minimized-tools-indicator";
import { useNavigate } from "react-router-dom";
import { Minus, Home, Bookmark, Info } from "lucide-react";

interface ToolLayoutProps {
  toolName: string;
  toolDescription?: string;
  children: React.ReactNode;
  onMinimize?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  onShowDocumentation?: () => void;
}

interface WindowControlsProps {
  onMinimize?: () => void;
  onNavigateHome?: () => void;
  onToggleFavorite?: () => void;
  onShowDocumentation?: () => void;
  isFavorite?: boolean;
  toolName: string;
  toolDescription?: string;
}

function WindowControls({
  onMinimize,
  onNavigateHome,
  onToggleFavorite,
  onShowDocumentation,
  isFavorite = false,
  toolName,
  toolDescription,
}: WindowControlsProps) {
  // Function to truncate description to 30 words max
  const truncateDescription = (desc: string): string => {
    const words = desc.split(" ");
    if (words.length <= 30) return desc;
    return words.slice(0, 30).join(" ") + "...";
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-2 bg-background/95 backdrop-blur">
      {/* Left spacer for balanced layout */}
      <div className="flex-1"></div>

      {/* Center - Tool Name */}
      <div className="flex-1 text-center relative group">
        <h3 className="text-lg font-semibold text-foreground cursor-default">
          {toolName}
        </h3>
        {/* Hover tooltip for description */}
        {toolDescription && (
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 px-3 py-2 bg-popover border border-border rounded-md shadow-md text-sm text-popover-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-w-md">
            {truncateDescription(toolDescription)}
          </div>
        )}
      </div>

      {/* Right - Controls */}
      <div className="flex-1 flex items-center gap-1 justify-end">
        {/* Documentation Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowDocumentation}
          className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
          title="Show Documentation"
          disabled={!onShowDocumentation}
        >
          <Info className="h-4 w-4 stroke-[1.5]" />
        </Button>

        {/* Home Button */}
        {onNavigateHome && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateHome}
            className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
            title="Go to Home"
          >
            <Home className="h-4 w-4 stroke-[1.5]" />
          </Button>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFavorite}
          className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          disabled={!onToggleFavorite}
        >
          <Bookmark
            className={`h-4 w-4 stroke-[1.5] ${
              isFavorite ? "fill-primary text-primary" : ""
            }`}
          />
        </Button>

        {/* Minimize Button */}
        {onMinimize && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
            title="Minimize to Drawer"
          >
            <Minus className="h-4 w-4 stroke-[1.5]" />
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
  onShowDocumentation,
  isFavorite = false,
}: ToolLayoutProps) {
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    navigate("/tools");
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

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header Area - Website Title */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h2
                  className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate("/")}
                  title="HOME"
                >
                  Vibe Tools
                </h2>
                <p className="text-sm text-muted-foreground">
                  Vibe once runs anytime
                </p>
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
            {/* Window Controls Bar with Tool Name */}
            <WindowControls
              onMinimize={onMinimize}
              onNavigateHome={handleNavigateHome}
              onToggleFavorite={onToggleFavorite}
              onShowDocumentation={onShowDocumentation}
              isFavorite={isFavorite}
              toolName={toolName}
              toolDescription={toolDescription}
            />

            {/* Tool Content - Below Tool Info */}
            <div className="flex-1 overflow-auto bg-muted/30">{children}</div>
          </div>

          {/* Minimized Tools Indicator - Managed by ToolLayout */}
          <MinimizedToolsIndicator />
        </main>
      </div>
    </SidebarProvider>
  );
}
