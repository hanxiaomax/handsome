import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ToolDetail } from "@/components/tool-detail";
import { WelcomePage } from "@/components/welcome-page";
import { ThemeToggle } from "@/components/theme-toggle";
import { tools } from "@/data/tools";

function HomepageContent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const { isMobile, setOpenMobile } = useSidebar();

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

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleNavigateToFavorites = () => {
    // Close mobile sidebar when navigating to favorites
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate("/favorites");
  };

  const selectedToolData = selectedTool
    ? tools.find((t) => t.id === selectedTool)
    : null;

  return (
    <>
      <AppSidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
        onNavigateHome={() => setSelectedTool(null)}
        onNavigateToFavorites={handleNavigateToFavorites}
      />
      <SidebarInset>
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {selectedToolData ? selectedToolData.name : "Tool Suite"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedToolData
                  ? "Tool Details"
                  : "Select a tool from the sidebar to view details"}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {selectedToolData ? (
            <ToolDetail tool={selectedToolData} onUseTool={handleUseTool} />
          ) : (
            <WelcomePage />
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
            "--sidebar-width": "20rem",
          } as React.CSSProperties
        }
      >
        <HomepageContent />
      </div>
    </SidebarProvider>
  );
}
