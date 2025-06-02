import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ToolDetail } from "@/components/tools/tool-detail";
import { ToolsGallery } from "@/components/navigation/tools-gallery";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { GlobalSearch } from "@/components/navigation/global-search";
import { tools } from "@/data/tools";

function HomepageContent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const { isMobile, setOpenMobile } = useSidebar();

  // Handle URL parameters for tool selection
  useEffect(() => {
    const toolParam = searchParams.get("tool");
    if (toolParam && tools.find((t) => t.id === toolParam)) {
      setSelectedTool(toolParam);
    }
  }, [searchParams]);

  const handleUseTool = (toolId: string) => {
    const tool = tools.find((t) => t.id === toolId);
    if (tool) {
      // Close mobile sidebar when navigating to tool
      if (isMobile) {
        setOpenMobile(false);
      }
      navigate(tool.path);
    }
  };

  const handleNavigateHome = () => {
    setSelectedTool(null);
    // Clear URL parameters
    setSearchParams({});
  };

  const selectedToolData = selectedTool
    ? tools.find((t) => t.id === selectedTool)
    : null;

  return (
    <>
      <AppSidebar
        selectedTool={selectedTool}
        onNavigateHome={handleNavigateHome}
      />
      <SidebarInset>
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {selectedToolData ? selectedToolData.name : "Vibe Tools"}
              </h2>
              {!selectedToolData && (
                <p className="text-sm text-muted-foreground">
                  Vibe once runs anytime
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

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {selectedToolData ? (
            <ToolDetail tool={selectedToolData} onUseTool={handleUseTool} />
          ) : (
            <ToolsGallery
              onUseTool={handleUseTool}
              selectedTool={selectedTool}
              showToolsGrid={true}
            />
          )}
        </div>
      </SidebarInset>
    </>
  );
}

export function Homepage() {
  return (
    <SidebarProvider>
      <div
        className="flex min-h-svh w-full"
        style={
          {
            "--sidebar-width": "16rem",
          } as React.CSSProperties
        }
      >
        <HomepageContent />
      </div>
    </SidebarProvider>
  );
}
