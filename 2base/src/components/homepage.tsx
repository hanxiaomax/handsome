import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ToolDetail } from "@/components/tool-detail";
import { WelcomePage } from "@/components/welcome-page";
import { ThemeToggle } from "@/components/theme-toggle";
import { tools } from "@/data/tools";

export function Homepage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleUseTool = (toolId: string) => {
    const tool = tools.find((t) => t.id === toolId);
    if (tool) {
      navigate(tool.path);
    }
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const selectedToolData = selectedTool
    ? tools.find((t) => t.id === selectedTool)
    : null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
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
        </main>
      </div>
    </SidebarProvider>
  );
}
