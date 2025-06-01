import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate } from "react-router-dom";

interface ToolLayoutProps {
  toolName: string;
  toolDescription?: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}

interface WindowControlsProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}

function WindowControls({
  onClose,
  onMinimize,
  onFullscreen,
  isFullscreen = false,
}: WindowControlsProps) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2"></div>
      <div className="flex items-center gap-2">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 transition-colors group shadow-sm"
            title="Back to Home"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-bold leading-none flex items-center justify-center w-full h-full">
              ×
            </span>
          </button>
        )}

        {/* Minimize Button */}
        {onMinimize && (
          <button
            onClick={onMinimize}
            className="w-5 h-5 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors group shadow-sm"
            title="Minimize to Drawer"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-bold leading-none flex items-center justify-center w-full h-full">
              −
            </span>
          </button>
        )}

        {/* Fullscreen Button */}
        {onFullscreen && (
          <button
            onClick={onFullscreen}
            className="w-5 h-5 rounded-full bg-green-500 hover:bg-green-600 transition-colors group shadow-sm"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-bold leading-none flex items-center justify-center w-full h-full">
              {isFullscreen ? "⌄" : "⌃"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export function ToolLayout({
  toolName,
  toolDescription,
  children,
  onClose,
  onMinimize,
  onFullscreen,
  isFullscreen = false,
}: ToolLayoutProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    // Navigate to homepage with tool selected (not directly to tool)
    navigate(`/?tool=${toolId}`);
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  const handleNavigateToFavorites = () => {
    navigate("/favorites");
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
        <AppSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
          onNavigateHome={handleNavigateHome}
          onNavigateToFavorites={handleNavigateToFavorites}
        />

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
              <ThemeToggle />
            </div>
          </header>

          {/* Main Content Area - Tool Implementation */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Window Controls Bar - Full Width */}
            <WindowControls
              onClose={onClose}
              onMinimize={onMinimize}
              onFullscreen={onFullscreen}
              isFullscreen={isFullscreen}
            />

            {/* Tool Content - Below Controls */}
            <div className="flex-1 overflow-auto bg-muted/30">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
