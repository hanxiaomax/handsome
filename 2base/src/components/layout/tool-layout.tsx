import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { GlobalSearch } from "@/components/navigation/global-search";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useNavigate } from "react-router-dom";
import { Minus, Home, Bookmark, Info, Settings, X } from "lucide-react";
import React from "react";

// Custom button interface for extensibility
interface CustomToolButton {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  variant?: "ghost" | "default" | "destructive" | "outline" | "secondary";
}

interface ToolLayoutProps {
  toolName: string;
  toolDescription?: string;
  children: React.ReactNode;
  onMinimize?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  onShowDocumentation?: () => void;
  customControls?: React.ReactNode;
  // Right sidebar props (renamed from rightPanel for clarity)
  rightSidebarContent?: React.ReactNode;
  rightSidebarTitle?: string;
  rightSidebarDescription?: string;
  isRightSidebarOpen?: boolean;
  onRightSidebarToggle?: () => void;
  onRightSidebarContentChange?: (
    content: React.ReactNode,
    title?: string,
    description?: string
  ) => void;
  // Custom buttons support
  customButtons?: CustomToolButton[];
}

interface WindowControlsProps {
  onMinimize?: () => void;
  onNavigateHome?: () => void;
  onToggleFavorite?: () => void;
  onShowDocumentation?: () => void;
  isFavorite?: boolean;
  toolName: string;
  toolDescription?: string;
  customControls?: React.ReactNode;
  customButtons?: CustomToolButton[];
  // Right sidebar controls
  onRightSidebarToggle?: () => void;
  isRightSidebarOpen?: boolean;
  hasRightSidebarContent?: boolean;
}

function WindowControls({
  onMinimize,
  onNavigateHome,
  onToggleFavorite,
  onShowDocumentation,
  isFavorite = false,
  toolName,
  toolDescription,
  customControls,
  customButtons = [],
  onRightSidebarToggle,
  isRightSidebarOpen = false,
  hasRightSidebarContent = false,
}: WindowControlsProps) {
  // Function to truncate description to 30 words max
  const truncateDescription = (desc: string): string => {
    const words = desc.split(" ");
    if (words.length <= 30) return desc;
    return words.slice(0, 30).join(" ") + "...";
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-2 bg-background/95 backdrop-blur">
      {/* Left - Custom Controls */}
      <div className="flex-1 flex items-center gap-2">{customControls}</div>

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

      {/* Right - Standard Controls */}
      <div className="flex-1 flex items-center gap-1 justify-end">
        {/* Custom Tool Buttons */}
        {customButtons.map((button) => (
          <div key={button.id} className="flex flex-col items-center gap-0.5">
            <Button
              variant={button.variant || "ghost"}
              size="sm"
              onClick={button.onClick}
              className={`h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground ${
                button.isActive ? "bg-accent text-accent-foreground" : ""
              }`}
              title={button.title}
              disabled={button.disabled}
            >
              <button.icon className="h-4 w-4 stroke-[1.5]" />
            </Button>
            <span className="text-[10px] text-muted-foreground leading-none">
              {button.title.split(" ")[0]}
            </span>
          </div>
        ))}

        {/* Separator between custom and system buttons */}
        {customButtons.length > 0 && (
          <div className="h-8 w-px bg-border mx-1"></div>
        )}

        {/* Documentation Button - Always present */}
        <div className="flex flex-col items-center gap-0.5">
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
          <span className="text-[10px] text-muted-foreground leading-none">
            Info
          </span>
        </div>

        {/* Right Sidebar Toggle Button - Settings */}
        <div className="flex flex-col items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRightSidebarToggle}
            className={`h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground ${
              isRightSidebarOpen ? "bg-accent text-accent-foreground" : ""
            } ${
              !hasRightSidebarContent ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={
              hasRightSidebarContent
                ? isRightSidebarOpen
                  ? "Close Sidebar"
                  : "Open Sidebar"
                : "No sidebar content available"
            }
            disabled={!hasRightSidebarContent || !onRightSidebarToggle}
          >
            <Settings className="h-4 w-4 stroke-[1.5]" />
          </Button>
          <span className="text-[10px] text-muted-foreground leading-none">
            Settings
          </span>
        </div>

        {/* Home Button - Always present */}
        <div className="flex flex-col items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateHome || (() => {})}
            className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
            title="Go to Home"
          >
            <Home className="h-4 w-4 stroke-[1.5]" />
          </Button>
          <span className="text-[10px] text-muted-foreground leading-none">
            Home
          </span>
        </div>

        {/* Favorite Button - Always present */}
        <div className="flex flex-col items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite || (() => {})}
            className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Bookmark
              className={`h-4 w-4 stroke-[1.5] ${
                isFavorite ? "fill-primary text-primary" : ""
              }`}
            />
          </Button>
          <span className="text-[10px] text-muted-foreground leading-none">
            {isFavorite ? "Saved" : "Save"}
          </span>
        </div>

        {/* Minimize Button - Always present */}
        <div className="flex flex-col items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
            title="Minimize to Drawer"
            disabled={!onMinimize}
          >
            <Minus className="h-4 w-4 stroke-[1.5]" />
          </Button>
          <span className="text-[10px] text-muted-foreground leading-none">
            Minimize
          </span>
        </div>
      </div>
    </div>
  );
}

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

function RightPanel({
  isOpen,
  onClose,
  title,
  description,
  children,
}: RightPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Right Panel Header */}
      <div className="border-b bg-background/95 backdrop-blur p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
            title="Close Panel"
          >
            <X className="h-4 w-4 stroke-[1.5]" />
          </Button>
        </div>
      </div>

      {/* Right Panel Content */}
      <div className="flex-1 overflow-auto p-4">{children}</div>
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
  customControls,
  rightSidebarContent,
  rightSidebarTitle = "Settings",
  rightSidebarDescription,
  isRightSidebarOpen = false,
  onRightSidebarToggle,
  onRightSidebarContentChange,
  customButtons = [],
}: ToolLayoutProps) {
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    navigate("/tools");
  };

  const handleCloseRightSidebar = () => {
    onRightSidebarToggle?.();
  };

  // Expose right sidebar content update function to child tools
  React.useEffect(() => {
    if (onRightSidebarContentChange) {
      onRightSidebarContentChange(
        rightSidebarContent,
        rightSidebarTitle,
        rightSidebarDescription
      );
    }
  }, [
    rightSidebarContent,
    rightSidebarTitle,
    rightSidebarDescription,
    onRightSidebarContentChange,
  ]);

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

          {/* Main Content Area - Tool Implementation with Resizable Panels */}
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
              customControls={customControls}
              customButtons={customButtons}
              onRightSidebarToggle={onRightSidebarToggle}
              isRightSidebarOpen={isRightSidebarOpen}
              hasRightSidebarContent={!!rightSidebarContent}
            />

            {/* Resizable Content Area */}
            <div className="flex-1 overflow-hidden">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Main Tool Content */}
                <ResizablePanel
                  defaultSize={
                    rightSidebarContent && isRightSidebarOpen ? 70 : 100
                  }
                  minSize={50}
                  className="flex flex-col"
                >
                  <div className="flex-1 overflow-auto bg-muted/30">
                    {children}
                  </div>
                </ResizablePanel>

                {/* Right Sidebar */}
                {rightSidebarContent && isRightSidebarOpen && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel
                      defaultSize={30}
                      minSize={25}
                      maxSize={50}
                      className="flex flex-col border-l"
                    >
                      <RightPanel
                        isOpen={isRightSidebarOpen}
                        onClose={handleCloseRightSidebar}
                        title={rightSidebarTitle}
                        description={rightSidebarDescription}
                      >
                        {rightSidebarContent}
                      </RightPanel>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </div>
          </div>

          {/* Minimized Tools Indicator is managed globally in App.tsx */}
        </main>
      </div>
    </SidebarProvider>
  );
}

// Export the CustomToolButton interface for use by tools
export type { CustomToolButton };
